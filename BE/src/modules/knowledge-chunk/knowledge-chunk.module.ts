import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { KnowledgeChunkDocument, KnowledgeChunkSchema } from './knowledge-chunk.schema.js'
import { KnowledgeChunkService } from './knowledge-chunk.service.js'
import { MongoKnowledgeChunkRepository } from './knowledge-chunk.mongo.repository.js'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './knowledge-chunk.repository.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeChunkDocument.name, schema: KnowledgeChunkSchema },
    ]),
  ],
  providers: [
    KnowledgeChunkService,
    { provide: KNOWLEDGE_CHUNK_REPOSITORY, useClass: MongoKnowledgeChunkRepository },
  ],
  exports: [KnowledgeChunkService],
})
export class KnowledgeChunkModule {}
