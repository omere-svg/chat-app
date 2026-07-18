import type { KnowledgeDocumentDocument } from './knowledge-document.schema.js'
import type { KnowledgeDocumentRecord } from './types/knowledge-document.entity.js'
import type { KnowledgeDocumentView } from './types/knowledge-document-view.js'

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

export function toKnowledgeDocumentView(
  document: KnowledgeDocumentRecord,
): KnowledgeDocumentView {
  return {
    id: document.id,
    filename: document.filename,
    status: document.status,
    chunkCount: document.chunkCount,
    byteSize: document.byteSize,
    createdAt: document.createdAt,
  }
}
