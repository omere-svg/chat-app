import { Inject, Injectable } from '@nestjs/common'
import { KNOWLEDGE_DOCUMENT_REPOSITORY } from './knowledge-document.repository.js'
import type { KnowledgeDocumentRepository } from './knowledge-document.repository.js'
import type { KnowledgeDocumentRecord } from './types/knowledge-document.entity.js'

@Injectable()
export class KnowledgeDocumentService {
  constructor(
    @Inject(KNOWLEDGE_DOCUMENT_REPOSITORY)
    private readonly documentRepository: KnowledgeDocumentRepository,
  ) {}

  findByContentHashForUser(
    userId: string,
    contentHash: string,
  ): Promise<KnowledgeDocumentRecord | null> {
    return this.documentRepository.findByContentHashForUser(userId, contentHash)
  }

  findByIdForUser(userId: string, documentId: string): Promise<KnowledgeDocumentRecord | null> {
    return this.documentRepository.findByIdForUser(userId, documentId)
  }

  listByUserNewestFirst(userId: string): Promise<KnowledgeDocumentRecord[]> {
    return this.documentRepository.listByUserNewestFirst(userId)
  }

  insert(document: KnowledgeDocumentRecord): Promise<KnowledgeDocumentRecord> {
    return this.documentRepository.insert(document)
  }

  deleteByIdForUser(userId: string, documentId: string): Promise<boolean> {
    return this.documentRepository.deleteByIdForUser(userId, documentId)
  }
}
