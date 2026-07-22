import { describe, expect, it, vi, type Mock } from 'vitest'
import { DeleteDocumentOrchestrator } from '../delete-document.orchestrator.js'
import type { KnowledgeDocumentService } from '../../knowledge-document/knowledge-document.service.js'
import type { KnowledgeChunkService } from '../../knowledge-chunk/knowledge-chunk.service.js'
import type { KnowledgeDocumentRecord } from '../../knowledge-document/types/knowledge-document.entity.js'

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
} = {}): {
  orchestrator: DeleteDocumentOrchestrator
  documentService: Mocked<KnowledgeDocumentService>
  chunkService: Mocked<KnowledgeChunkService>
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
    retrieveSimilarForUser: vi.fn().mockResolvedValue([]),
    ...options.chunkService,
  }

  const orchestrator = new DeleteDocumentOrchestrator(
    documentService as unknown as KnowledgeDocumentService,
    chunkService as unknown as KnowledgeChunkService,
  )
  return { orchestrator, documentService, chunkService }
}

describe('DeleteDocumentOrchestrator.delete', () => {
  it('deletes chunks before the document and is scoped to the owner', async () => {
    const { orchestrator, documentService, chunkService } = buildOrchestrator({
      documentService: {
        findByIdForUser: vi.fn().mockResolvedValue(existingDocument({ id: 'kdoc-1' })),
      },
    })

    await orchestrator.delete('user-1', 'kdoc-1')

    expect(chunkService.deleteByDocumentForUser).toHaveBeenCalledWith('user-1', 'kdoc-1')
    expect(chunkService.deleteByDocumentForUser.mock.invocationCallOrder[0]).toBeLessThan(
      documentService.deleteByIdForUser.mock.invocationCallOrder[0] ?? Infinity,
    )
  })

  it('throws 404 for an unknown or unowned document', async () => {
    const { orchestrator } = buildOrchestrator({
      documentService: { findByIdForUser: vi.fn().mockResolvedValue(null) },
    })
    await expect(orchestrator.delete('user-1', 'kdoc-x')).rejects.toMatchObject({
      code: 'KNOWLEDGE_DOCUMENT_NOT_FOUND',
    })
  })
})
