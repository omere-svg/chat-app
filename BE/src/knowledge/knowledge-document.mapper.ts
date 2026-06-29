import type { KnowledgeDocumentDocument } from './knowledge-document.schema.js'
import type { KnowledgeDocumentRecord } from './knowledge-document.entity.js'

export function toKnowledgeDocumentRecord(
  document: KnowledgeDocumentDocument,
): KnowledgeDocumentRecord {
  return {
    id: document._id,
    userId: document.userId,
    filename: document.filename,
    contentHash: document.contentHash,
    byteSize: document.byteSize,
    chunkCount: document.chunkCount,
    status: document.status,
    createdAt: document.createdAt.toISOString(),
  }
}
