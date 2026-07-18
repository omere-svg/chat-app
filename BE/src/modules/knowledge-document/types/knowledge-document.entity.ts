export type IngestionStatus = 'ready' | 'failed'

export interface KnowledgeDocumentRecord {
  id: string
  userId: string
  filename: string
  contentHash: string
  byteSize: number
  chunkCount: number
  status: IngestionStatus
  createdAt: string
}
