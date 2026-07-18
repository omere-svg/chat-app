import type {
  BuildVectorSearchParams,
  VectorSearchPipeline,
} from '../types/vector-search-pipeline.js'

export function buildUserScopedVectorSearchPipeline(
  params: BuildVectorSearchParams,
): VectorSearchPipeline {
  return [
    {
      $vectorSearch: {
        index: params.indexName,
        path: 'embedding',
        queryVector: params.queryEmbedding,
        numCandidates: params.numCandidates,
        limit: params.limit,
        filter: { userId: { $eq: params.userId } },
      },
    },
    {
      $project: {
        _id: 1,
        documentId: 1,
        documentName: 1,
        chunkIndex: 1,
        text: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]
}
