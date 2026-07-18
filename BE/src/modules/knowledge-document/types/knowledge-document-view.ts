import type { IngestionStatus } from './knowledge-document.entity.js'

export interface KnowledgeDocumentView {
  id: string
  filename: string
  status: IngestionStatus
  chunkCount: number
  byteSize: number
  createdAt: string
}
