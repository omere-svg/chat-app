import { EMBEDDING_DIMENSIONS } from '../knowledge-chunk.entity.js'

// The single source of truth for the Atlas Vector Search index on the chunks
// collection. Committed in the repo (the spec requires the index to be defined here)
// and applied by `npm run provision:vector-index`.
//
// `userId` is declared as a filter field so $vectorSearch can pre-filter the ANN scan
// by owner — the index-level half of the cross-user isolation guarantee.
export const KNOWLEDGE_CHUNKS_COLLECTION = 'knowledge_chunks'

export const DEFAULT_ATLAS_VECTOR_INDEX = 'knowledge_chunks_vector_index'

export interface AtlasVectorSearchIndexDefinition {
  fields: Array<
    | { type: 'vector'; path: 'embedding'; numDimensions: number; similarity: 'cosine' }
    | { type: 'filter'; path: 'userId' }
  >
}

export const KNOWLEDGE_CHUNKS_VECTOR_INDEX_DEFINITION: AtlasVectorSearchIndexDefinition = {
  fields: [
    {
      type: 'vector',
      path: 'embedding',
      numDimensions: EMBEDDING_DIMENSIONS,
      similarity: 'cosine',
    },
    { type: 'filter', path: 'userId' },
  ],
}
