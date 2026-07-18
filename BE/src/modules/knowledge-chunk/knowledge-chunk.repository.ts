import type { KnowledgeChunkRecord } from './types/knowledge-chunk.entity.js'

export const KNOWLEDGE_CHUNK_REPOSITORY = Symbol('KNOWLEDGE_CHUNK_REPOSITORY')

export interface KnowledgeChunkRepository {
  insertMany(chunks: KnowledgeChunkRecord[]): Promise<void>

  deleteByDocumentForUser(userId: string, documentId: string): Promise<number>
}
