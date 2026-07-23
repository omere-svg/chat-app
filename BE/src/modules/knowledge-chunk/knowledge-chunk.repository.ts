import type { KnowledgeChunkRecord, RetrievedChunk } from './types/knowledge-chunk.entity.js'
import type { SearchSimilarParams } from './types/search-similar-params.js'

export const KNOWLEDGE_CHUNK_REPOSITORY = Symbol('KNOWLEDGE_CHUNK_REPOSITORY')

export interface KnowledgeChunkRepository {
  insertMany(chunks: KnowledgeChunkRecord[]): Promise<void>

  deleteByDocumentForUser(userId: string, documentId: string): Promise<number>

  searchSimilarForUser(params: SearchSimilarParams): Promise<RetrievedChunk[]>
}
