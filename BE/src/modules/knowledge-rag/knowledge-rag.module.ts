import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  KnowledgeChunkDocument,
  KnowledgeChunkSchema,
} from '../../modules/knowledge-chunk/knowledge-chunk.schema.js'
import { TextChunker } from './ingestion/text-chunker.js'
import { AtlasVectorRetriever } from './retrieval/atlas-vector.retriever.js'
import { VECTOR_RETRIEVER } from './retrieval/vector-retriever.tokens.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeChunkDocument.name, schema: KnowledgeChunkSchema },
    ]),
  ],
  providers: [
    TextChunker,
    { provide: VECTOR_RETRIEVER, useClass: AtlasVectorRetriever },
  ],
  exports: [TextChunker, VECTOR_RETRIEVER],
})
export class KnowledgeRagModule {}
