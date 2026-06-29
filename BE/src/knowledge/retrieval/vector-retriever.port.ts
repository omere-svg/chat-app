import type { RetrievedChunk } from '../knowledge-chunk.entity.js'

export const VECTOR_RETRIEVER = Symbol('VECTOR_RETRIEVER')

export interface RetrieveSimilarParams {
  // Owner scope. The retriever pre-filters on this so a query can only ever match the
  // requesting user's own chunks — there is no code path that omits it.
  userId: string
  queryEmbedding: number[]
  // Max chunks to return (top-K).
  limit: number
  // Cosine-similarity floor in [0, 1]. Chunks below it are dropped; an empty result is
  // the signal the tutor uses to refuse rather than answer ungrounded.
  minScore: number
}

// Reads the user's most similar chunks by vector distance. The tutor RAG chain depends
// on this port (not on Mongo) so it can be faked in tests without an Atlas cluster.
export interface VectorRetriever {
  retrieveSimilarForUser(params: RetrieveSimilarParams): Promise<RetrievedChunk[]>
}
