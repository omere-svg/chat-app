export interface KnowledgeChunkRecord {
  id: string
  userId: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  embedding: number[]
}

export interface RetrievedChunk {
  id: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  score: number
}
