import { describe, expect, it, vi, type Mock } from 'vitest'
import { KnowledgeService } from '../knowledge/knowledge.service.js'
import type { KnowledgeDocumentRepository } from '../knowledge/repository/knowledge-document-repository.port.js'
import type { KnowledgeChunkRepository } from '../knowledge/repository/knowledge-chunk-repository.port.js'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { TextChunker } from '../knowledge/ingestion/text-chunker.js'
import type { UploadedFile } from '../knowledge/ingestion/supported-formats.js'
import type { KnowledgeDocumentRecord } from '../knowledge/knowledge-document.entity.js'
import type { KnowledgeChunkRecord } from '../knowledge/knowledge-chunk.entity.js'

function fileOf(text: string, originalname = 'notes.md'): UploadedFile {
  const buffer = Buffer.from(text, 'utf8')
  return { originalname, mimetype: 'text/markdown', size: buffer.byteLength, buffer }
}

function existingDocument(overrides: Partial<KnowledgeDocumentRecord> = {}): KnowledgeDocumentRecord {
  return {
    id: 'kdoc-existing',
    userId: 'user-1',
    filename: 'notes.md',
    contentHash: 'hash',
    byteSize: 10,
    chunkCount: 2,
    status: 'ready',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

type Mocked<T> = { [K in keyof T]: Mock }

function buildService(options: {
  documentRepository?: Partial<Mocked<KnowledgeDocumentRepository>>
  chunkRepository?: Partial<Mocked<KnowledgeChunkRepository>>
  chunks?: string[]
} = {}): {
  service: KnowledgeService
  documentRepository: Mocked<KnowledgeDocumentRepository>
  chunkRepository: Mocked<KnowledgeChunkRepository>
  embedDocuments: Mock
} {
  const documentRepository: Mocked<KnowledgeDocumentRepository> = {
    findByContentHashForUser: vi.fn().mockResolvedValue(null),
    findByIdForUser: vi.fn().mockResolvedValue(null),
    listByUserNewestFirst: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockImplementation((record: KnowledgeDocumentRecord) => Promise.resolve(record)),
    deleteByIdForUser: vi.fn().mockResolvedValue(true),
    ...options.documentRepository,
  }
  const chunkRepository: Mocked<KnowledgeChunkRepository> = {
    insertMany: vi.fn().mockResolvedValue(undefined),
    deleteByDocumentForUser: vi.fn().mockResolvedValue(0),
    ...options.chunkRepository,
  }
  const chunkTexts = options.chunks ?? ['chunk one', 'chunk two']
  const embedDocuments = vi.fn().mockResolvedValue(chunkTexts.map((_, index) => [index, index + 1]))
  const embeddings = { embedDocuments, embedQuery: vi.fn() } as unknown as EmbeddingsProvider
  const textChunker = { chunk: vi.fn().mockResolvedValue(chunkTexts) } as unknown as TextChunker

  const service = new KnowledgeService(documentRepository, chunkRepository, embeddings, textChunker)
  return { service, documentRepository, chunkRepository, embedDocuments }
}

describe('KnowledgeService.ingestDocument', () => {
  it('chunks, embeds, and stores chunks then the document, scoped to the owner', async () => {
    const { service, documentRepository, chunkRepository } = buildService()

    const view = await service.ingestDocument('user-1', fileOf('hello world'))

    expect(chunkRepository.insertMany).toHaveBeenCalledOnce()
    const storedChunks = chunkRepository.insertMany.mock.calls[0]?.[0] as KnowledgeChunkRecord[]
    expect(storedChunks).toHaveLength(2)
    expect(storedChunks.every((chunk) => chunk.userId === 'user-1')).toBe(true)
    expect(storedChunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1])
    // Chunks are written before the document record (the commit marker).
    expect(chunkRepository.insertMany.mock.invocationCallOrder[0]).toBeLessThan(
      documentRepository.insert.mock.invocationCallOrder[0] ?? Infinity,
    )
    expect(view.status).toBe('ready')
    expect(view.chunkCount).toBe(2)
  })

  it('is an idempotent no-op when identical content was already ingested', async () => {
    const { service, documentRepository, chunkRepository, embedDocuments } = buildService({
      documentRepository: {
        findByContentHashForUser: vi.fn().mockResolvedValue(existingDocument()),
      },
    })

    const view = await service.ingestDocument('user-1', fileOf('hello world'))

    expect(view.id).toBe('kdoc-existing')
    expect(embedDocuments).not.toHaveBeenCalled()
    expect(chunkRepository.insertMany).not.toHaveBeenCalled()
    expect(documentRepository.insert).not.toHaveBeenCalled()
  })

  it('rejects an empty document', async () => {
    const { service } = buildService()
    await expect(service.ingestDocument('user-1', fileOf('   '))).rejects.toMatchObject({
      response: { code: 'VALIDATION_ERROR' },
    })
  })

  it('rejects a document with no extractable text', async () => {
    const { service } = buildService({ chunks: [] })
    await expect(service.ingestDocument('user-1', fileOf('content'))).rejects.toMatchObject({
      response: { code: 'VALIDATION_ERROR' },
    })
  })

  it('cleans up its chunks and returns the winner when it loses the dedup race', async () => {
    const winner = existingDocument({ id: 'kdoc-winner' })
    const findByContentHashForUser = vi
      .fn()
      .mockResolvedValueOnce(null) // pre-write check: no existing doc yet
      .mockResolvedValueOnce(winner) // post-conflict: the concurrent upload that won
    const { service, chunkRepository } = buildService({
      documentRepository: {
        findByContentHashForUser,
        insert: vi.fn().mockRejectedValue({ code: 11000 }),
      },
    })

    const view = await service.ingestDocument('user-1', fileOf('hello world'))

    expect(view.id).toBe('kdoc-winner')
    // The orphan chunks written for the losing attempt are deleted.
    expect(chunkRepository.deleteByDocumentForUser).toHaveBeenCalledWith('user-1', expect.any(String))
  })
})

describe('KnowledgeService.deleteDocument', () => {
  it('deletes chunks before the document and 404s when not owned', async () => {
    const { service, documentRepository, chunkRepository } = buildService({
      documentRepository: {
        findByIdForUser: vi.fn().mockResolvedValue(existingDocument({ id: 'kdoc-1' })),
      },
    })

    await service.deleteDocument('user-1', 'kdoc-1')

    expect(chunkRepository.deleteByDocumentForUser).toHaveBeenCalledWith('user-1', 'kdoc-1')
    expect(chunkRepository.deleteByDocumentForUser.mock.invocationCallOrder[0]).toBeLessThan(
      documentRepository.deleteByIdForUser.mock.invocationCallOrder[0] ?? Infinity,
    )
  })

  it('throws 404 for an unknown or unowned document', async () => {
    const { service } = buildService({
      documentRepository: { findByIdForUser: vi.fn().mockResolvedValue(null) },
    })
    await expect(service.deleteDocument('user-1', 'kdoc-x')).rejects.toMatchObject({
      response: { code: 'KNOWLEDGE_DOCUMENT_NOT_FOUND' },
    })
  })
})
