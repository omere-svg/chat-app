import type { KnowledgeDocumentRecord } from './types/knowledge-document.entity.js'

export const KNOWLEDGE_DOCUMENT_REPOSITORY = Symbol('KNOWLEDGE_DOCUMENT_REPOSITORY')

export interface KnowledgeDocumentRepository {
  findByContentHashForUser(
    userId: string,
    contentHash: string,
  ): Promise<KnowledgeDocumentRecord | null>

  findByIdForUser(userId: string, documentId: string): Promise<KnowledgeDocumentRecord | null>

  listByUserNewestFirst(userId: string): Promise<KnowledgeDocumentRecord[]>

  insert(document: KnowledgeDocumentRecord): Promise<KnowledgeDocumentRecord>

  deleteByIdForUser(userId: string, documentId: string): Promise<boolean>
}
