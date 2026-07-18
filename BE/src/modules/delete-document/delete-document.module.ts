import { Module } from '@nestjs/common'
import { KnowledgeDocumentModule } from '../knowledge-document/knowledge-document.module.js'
import { KnowledgeChunkModule } from '../knowledge-chunk/knowledge-chunk.module.js'
import { DeleteDocumentOrchestrator } from './delete-document.orchestrator.js'

@Module({
  imports: [KnowledgeDocumentModule, KnowledgeChunkModule],
  providers: [DeleteDocumentOrchestrator],
  exports: [DeleteDocumentOrchestrator],
})
export class DeleteDocumentModule {}
