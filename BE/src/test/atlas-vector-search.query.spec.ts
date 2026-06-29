import { describe, expect, it } from 'vitest'
import { buildUserScopedVectorSearchPipeline } from '../knowledge/retrieval/atlas-vector-search.query.js'

// The cross-user isolation guarantee lives in this pipeline: $vectorSearch is pre-
// filtered to a single owner. mongodb-memory-server cannot run $vectorSearch, so we
// pin the guarantee at the query-builder level instead, where it is fully provable.
const baseParams = {
  indexName: 'knowledge_chunks_vector_index',
  userId: 'user-1',
  queryEmbedding: [0.1, 0.2, 0.3],
  limit: 5,
  numCandidates: 50,
}

describe('buildUserScopedVectorSearchPipeline', () => {
  it('always pre-filters the vector search to the requested user', () => {
    const [search] = buildUserScopedVectorSearchPipeline(baseParams)
    expect(search.$vectorSearch.filter).toEqual({ userId: { $eq: 'user-1' } })
  })

  it('scopes to exactly the user id given — no other user can be reached', () => {
    const [search] = buildUserScopedVectorSearchPipeline({ ...baseParams, userId: 'user-2' })
    expect(search.$vectorSearch.filter.userId.$eq).toBe('user-2')
  })

  it('searches the embedding field of the configured index with the given vector', () => {
    const [search] = buildUserScopedVectorSearchPipeline(baseParams)
    expect(search.$vectorSearch).toMatchObject({
      index: 'knowledge_chunks_vector_index',
      path: 'embedding',
      queryVector: [0.1, 0.2, 0.3],
      limit: 5,
      numCandidates: 50,
    })
  })

  it('projects the similarity score and chunk fields needed for citations', () => {
    const [, project] = buildUserScopedVectorSearchPipeline(baseParams)
    expect(project.$project).toMatchObject({
      _id: 1,
      documentId: 1,
      documentName: 1,
      chunkIndex: 1,
      text: 1,
      score: { $meta: 'vectorSearchScore' },
    })
  })
})
