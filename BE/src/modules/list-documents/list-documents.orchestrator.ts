import { Injectable } from '@nestjs/common'
import { KnowledgeDocumentService } from '../knowledge-document/knowledge-document.service.js'
import { toKnowledgeDocumentView } from '../knowledge-document/knowledge-document.mapper.js'
import type { KnowledgeDocumentView } from '../knowledge-document/types/knowledge-document-view.js'

@Injectable()
export class ListDocumentsOrchestrator {
  constructor(private readonly documentService: KnowledgeDocumentService) {}

  async list(userId: string): Promise<KnowledgeDocumentView[]> {
    const documents = await this.documentService.listByUserNewestFirst(userId)
    return documents.map(toKnowledgeDocumentView)
  }
}
