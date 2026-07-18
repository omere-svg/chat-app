import type { RetrievedChunk } from '../../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'

export interface RetrieveSimilarParams {
  userId: string
  queryEmbedding: number[]
  limit: number
  minScore: number
}

export interface VectorRetriever {
  retrieveSimilarForUser(params: RetrieveSimilarParams): Promise<RetrievedChunk[]>
}
