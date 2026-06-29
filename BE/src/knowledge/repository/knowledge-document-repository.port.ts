import type { KnowledgeDocumentRecord } from '../knowledge-document.entity.js'

export const KNOWLEDGE_DOCUMENT_REPOSITORY = Symbol('KNOWLEDGE_DOCUMENT_REPOSITORY')

export interface KnowledgeDocumentRepository {
  // The user's existing document for this content hash, if any. Backs the cheap
  // pre-write dedup check so identical re-uploads skip re-embedding.
  findByContentHashForUser(
    userId: string,
    contentHash: string,
  ): Promise<KnowledgeDocumentRecord | null>

  // The user's own document by id. Returns null for an unknown id or another user's
  // document, so callers cannot act on documents they do not own.
  findByIdForUser(userId: string, documentId: string): Promise<KnowledgeDocumentRecord | null>

  listByUserNewestFirst(userId: string): Promise<KnowledgeDocumentRecord[]>

  // Inserts the document record (the ingestion commit marker). Throws a duplicate-key
  // error when another upload already owns this (userId, contentHash); the caller
  // treats that as the idempotent-reupload race and returns the winner.
  insert(document: KnowledgeDocumentRecord): Promise<KnowledgeDocumentRecord>

  // Deletes the user's document record by id. Returns true when a record was removed,
  // false when none matched (unknown id or not owned).
  deleteByIdForUser(userId: string, documentId: string): Promise<boolean>
}
