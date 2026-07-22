import { EMBEDDING_DIMENSIONS } from '../../../modules/knowledge-chunk/constants.js'

export { KNOWLEDGE_CHUNKS_COLLECTION } from '../../../modules/knowledge-chunk/constants.js'

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
