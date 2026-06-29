// Builds the Atlas `$vectorSearch` aggregation for user-scoped chunk retrieval.
//
// Kept as a pure function with no Mongo dependency so the security-critical guarantee —
// every vector query is pre-filtered to a single owner — is unit-testable without an
// Atlas cluster (which `mongodb-memory-server` cannot provide). The `userId` filter is
// not optional: it is baked into the only stage this module exports.

export interface BuildVectorSearchParams {
  indexName: string
  userId: string
  queryEmbedding: number[]
  limit: number
  // Candidate pool the ANN search scans before returning `limit`. Larger trades latency
  // for recall; Atlas recommends well above `limit`.
  numCandidates: number
}

export interface VectorSearchStage {
  $vectorSearch: {
    index: string
    path: 'embedding'
    queryVector: number[]
    numCandidates: number
    limit: number
    // Pre-filter applied during the ANN scan. Restricting to the owner here (not in a
    // later $match) is what makes cross-user retrieval impossible.
    filter: { userId: { $eq: string } }
  }
}

export interface ProjectScoreStage {
  $project: {
    _id: 1
    documentId: 1
    documentName: 1
    chunkIndex: 1
    text: 1
    score: { $meta: 'vectorSearchScore' }
  }
}

export type VectorSearchPipeline = readonly [VectorSearchStage, ProjectScoreStage]

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
