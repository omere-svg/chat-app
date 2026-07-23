export interface BuildVectorSearchParams {
  indexName: string
  userId: string
  queryEmbedding: number[]
  limit: number
  numCandidates: number
}

export interface VectorSearchStage {
  $vectorSearch: {
    index: string
    path: 'embedding'
    queryVector: number[]
    numCandidates: number
    limit: number
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

export interface VectorSearchHit {
  _id: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  score: number
}
