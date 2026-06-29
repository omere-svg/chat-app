import type { IngestionStatus, KnowledgeDocumentRecord } from './knowledge-document.entity.js'

// The client-facing shape of an uploaded document. Drops internal fields (userId,
// contentHash) — the client never needs them and they should not leave the server.
export interface KnowledgeDocumentView {
  id: string
  filename: string
  status: IngestionStatus
  chunkCount: number
  byteSize: number
  createdAt: string
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
