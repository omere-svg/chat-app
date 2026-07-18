import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { KnowledgeDocumentDocument, KnowledgeDocumentSchema } from './knowledge-document.schema.js'
import { KnowledgeDocumentService } from './knowledge-document.service.js'
import { MongoKnowledgeDocumentRepository } from './knowledge-document.mongo.repository.js'
import { KNOWLEDGE_DOCUMENT_REPOSITORY } from './knowledge-document.repository.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeDocumentDocument.name, schema: KnowledgeDocumentSchema },
    ]),
  ],
  providers: [
    KnowledgeDocumentService,
    { provide: KNOWLEDGE_DOCUMENT_REPOSITORY, useClass: MongoKnowledgeDocumentRepository },
  ],
  exports: [KnowledgeDocumentService],
})
export class KnowledgeDocumentModule {}
