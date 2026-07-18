import { Injectable } from '@nestjs/common'
import { KnowledgeDocumentService } from '../knowledge-document/knowledge-document.service.js'
import { KnowledgeChunkService } from '../knowledge-chunk/knowledge-chunk.service.js'
import { KnowledgeDocumentNotFoundError } from './errors/knowledge-document-not-found.error.js'

@Injectable()
export class DeleteDocumentOrchestrator {
  constructor(
    private readonly documentService: KnowledgeDocumentService,
    private readonly chunkService: KnowledgeChunkService,
  ) {}

  async delete(userId: string, documentId: string): Promise<void> {
    const document = await this.documentService.findByIdForUser(userId, documentId)
    if (document === null) {
      throw new KnowledgeDocumentNotFoundError()
    }

    await this.chunkService.deleteByDocumentForUser(userId, documentId)
    await this.documentService.deleteByIdForUser(userId, documentId)
  }
}
