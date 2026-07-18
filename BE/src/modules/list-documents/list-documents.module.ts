import { Module } from '@nestjs/common'
import { KnowledgeDocumentModule } from '../knowledge-document/knowledge-document.module.js'
import { ListDocumentsOrchestrator } from './list-documents.orchestrator.js'

@Module({
  imports: [KnowledgeDocumentModule],
  providers: [ListDocumentsOrchestrator],
  exports: [ListDocumentsOrchestrator],
})
export class ListDocumentsModule {}
