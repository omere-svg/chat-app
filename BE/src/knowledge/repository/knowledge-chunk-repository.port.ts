import type { KnowledgeChunkRecord } from '../knowledge-chunk.entity.js'

export const KNOWLEDGE_CHUNK_REPOSITORY = Symbol('KNOWLEDGE_CHUNK_REPOSITORY')

// Write/lifecycle access to the chunks collection. Vector reads live behind the
// separate VectorRetriever port so the tutor chain can fake retrieval without a DB.
export interface KnowledgeChunkRepository {
  insertMany(chunks: KnowledgeChunkRecord[]): Promise<void>

  // Removes every chunk of a document for this owner. Returns the count removed.
  // Used both by document deletion and by ingestion's cleanup of a partial/losing write.
  deleteByDocumentForUser(userId: string, documentId: string): Promise<number>
}
