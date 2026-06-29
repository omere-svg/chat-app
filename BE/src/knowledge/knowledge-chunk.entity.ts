// Dimensionality of OpenAI text-embedding-3-small. The Atlas vector index and every
// stored embedding must agree on this; a mismatch makes $vectorSearch reject the query.
export const EMBEDDING_DIMENSIONS = 1536

// One embedded slice of a document. Chunks are the unit of retrieval and of citation:
// a tutor answer cites the chunks it was grounded in.
export interface KnowledgeChunkRecord {
  id: string
  // Owner — duplicated from the parent document so the vector query can pre-filter on
  // it without a join. This is the field that makes cross-user retrieval impossible.
  userId: string
  documentId: string
  // Denormalized for citations so a cited chunk names its source without a doc lookup.
  documentName: string
  // Position within the document, 0-based. Orders chunks and disambiguates citations.
  chunkIndex: number
  text: string
  embedding: number[]
}

// A chunk returned by vector search, with its similarity score. Excludes the raw
// embedding — callers (the RAG chain, citations) never need the vector back.
export interface RetrievedChunk {
  id: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  // Cosine similarity in [0, 1]; higher is closer. Gates the grounding threshold.
  score: number
}
