// A document a user uploaded into their private knowledge base. The document record
// is the commit marker for an ingestion: its chunks (KnowledgeChunkRecord) are only
// considered live once this record exists with status 'ready'.
export type IngestionStatus = 'ready' | 'failed'

export interface KnowledgeDocumentRecord {
  id: string
  // Owner. Every read path filters on this so one user can never see another's docs.
  userId: string
  filename: string
  // sha256 of the raw file bytes. Identity for dedup: re-uploading identical content
  // is an idempotent no-op rather than a second copy.
  contentHash: string
  byteSize: number
  chunkCount: number
  status: IngestionStatus
  createdAt: string
}
