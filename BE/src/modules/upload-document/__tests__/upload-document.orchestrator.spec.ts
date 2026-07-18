import { describe, expect, it, vi, type Mock } from 'vitest'
import { UploadDocumentOrchestrator } from '../upload-document.orchestrator.js'
import type { KnowledgeDocumentService } from '../../knowledge-document/knowledge-document.service.js'
import type { KnowledgeChunkService } from '../../knowledge-chunk/knowledge-chunk.service.js'
import type { EmbeddingsProvider } from '../../embeddings/types/embeddings-provider.js'
import type { TextChunker } from '../../knowledge-rag/ingestion/text-chunker.js'
import type { UploadedFile } from '../../knowledge-rag/types/uploaded-file.js'
import type { KnowledgeDocumentRecord } from '../../knowledge-document/types/knowledge-document.entity.js'
import type { KnowledgeChunkRecord } from '../../knowledge-chunk/types/knowledge-chunk.entity.js'

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

function buildOrchestrator(options: {
  documentService?: Partial<Mocked<KnowledgeDocumentService>>
  chunkService?: Partial<Mocked<KnowledgeChunkService>>
  chunks?: string[]
} = {}): {
  orchestrator: UploadDocumentOrchestrator
  documentService: Mocked<KnowledgeDocumentService>
  chunkService: Mocked<KnowledgeChunkService>
  embedDocuments: Mock
} {
  const documentService: Mocked<KnowledgeDocumentService> = {
    findByContentHashForUser: vi.fn().mockResolvedValue(null),
    findByIdForUser: vi.fn().mockResolvedValue(null),
    listByUserNewestFirst: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockImplementation((record: KnowledgeDocumentRecord) => Promise.resolve(record)),
    deleteByIdForUser: vi.fn().mockResolvedValue(true),
    ...options.documentService,
  }
  const chunkService: Mocked<KnowledgeChunkService> = {
    insertMany: vi.fn().mockResolvedValue(undefined),
    deleteByDocumentForUser: vi.fn().mockResolvedValue(0),
    ...options.chunkService,
  }
  const chunkTexts = options.chunks ?? ['chunk one', 'chunk two']
  const embedDocuments = vi.fn().mockResolvedValue(chunkTexts.map((_, index) => [index, index + 1]))
  const embeddings = { embedDocuments, embedQuery: vi.fn() } as unknown as EmbeddingsProvider
  const textChunker = { chunk: vi.fn().mockResolvedValue(chunkTexts) } as unknown as TextChunker

  const orchestrator = new UploadDocumentOrchestrator(
    documentService as unknown as KnowledgeDocumentService,
    chunkService as unknown as KnowledgeChunkService,
    embeddings,
    textChunker,
  )
  return { orchestrator, documentService, chunkService, embedDocuments }
}

describe('UploadDocumentOrchestrator.upload', () => {
  it('chunks, embeds, and stores chunks then the document, scoped to the owner', async () => {
    const { orchestrator, documentService, chunkService } = buildOrchestrator()

    const view = await orchestrator.upload('user-1', fileOf('hello world'))

    expect(chunkService.insertMany).toHaveBeenCalledOnce()
    const storedChunks = chunkService.insertMany.mock.calls[0]?.[0] as KnowledgeChunkRecord[]
    expect(storedChunks).toHaveLength(2)
    expect(storedChunks.every((chunk) => chunk.userId === 'user-1')).toBe(true)
    expect(storedChunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1])
    expect(chunkService.insertMany.mock.invocationCallOrder[0]).toBeLessThan(
      documentService.insert.mock.invocationCallOrder[0] ?? Infinity,
    )
    expect(view.status).toBe('ready')
    expect(view.chunkCount).toBe(2)
  })

  it('is an idempotent no-op when identical content was already ingested', async () => {
    const { orchestrator, documentService, chunkService, embedDocuments } = buildOrchestrator({
      documentService: {
        findByContentHashForUser: vi.fn().mockResolvedValue(existingDocument()),
      },
    })

    const view = await orchestrator.upload('user-1', fileOf('hello world'))

    expect(view.id).toBe('kdoc-existing')
    expect(embedDocuments).not.toHaveBeenCalled()
    expect(chunkService.insertMany).not.toHaveBeenCalled()
    expect(documentService.insert).not.toHaveBeenCalled()
  })

  it('rejects an empty document', async () => {
    const { orchestrator } = buildOrchestrator()
    await expect(orchestrator.upload('user-1', fileOf('   '))).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    })
  })

  it('rejects a document with no extractable text', async () => {
    const { orchestrator } = buildOrchestrator({ chunks: [] })
    await expect(orchestrator.upload('user-1', fileOf('content'))).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    })
  })

  it('cleans up its chunks and returns the winner when it loses the dedup race', async () => {
    const winner = existingDocument({ id: 'kdoc-winner' })
    const findByContentHashForUser = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(winner)
    const { orchestrator, chunkService } = buildOrchestrator({
      documentService: {
        findByContentHashForUser,
        insert: vi.fn().mockRejectedValue({ code: 11000 }),
      },
    })

    const view = await orchestrator.upload('user-1', fileOf('hello world'))

    expect(view.id).toBe('kdoc-winner')
    expect(chunkService.deleteByDocumentForUser).toHaveBeenCalledWith('user-1', expect.any(String))
  })
})
