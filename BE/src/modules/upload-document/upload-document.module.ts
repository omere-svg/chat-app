import { Module } from '@nestjs/common'
import { KnowledgeDocumentModule } from '../knowledge-document/knowledge-document.module.js'
import { KnowledgeChunkModule } from '../knowledge-chunk/knowledge-chunk.module.js'
import { KnowledgeRagModule } from '../knowledge-rag/knowledge-rag.module.js'
import { EmbeddingsModule } from '../embeddings/embeddings.module.js'
import { UploadDocumentOrchestrator } from './upload-document.orchestrator.js'

@Module({
  imports: [KnowledgeDocumentModule, KnowledgeChunkModule, KnowledgeRagModule, EmbeddingsModule],
  providers: [UploadDocumentOrchestrator],
  exports: [UploadDocumentOrchestrator],
})
export class UploadDocumentModule {}
