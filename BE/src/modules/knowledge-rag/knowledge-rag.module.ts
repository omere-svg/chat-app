import { Module } from '@nestjs/common'
import { KnowledgeChunkModule } from '../../modules/knowledge-chunk/knowledge-chunk.module.js'
import { TextChunker } from './ingestion/text-chunker.js'
import { AtlasVectorRetriever } from './retrieval/atlas-vector.retriever.js'
import { VECTOR_RETRIEVER } from './retrieval/vector-retriever.tokens.js'

@Module({
  imports: [KnowledgeChunkModule],
  providers: [
    TextChunker,
    { provide: VECTOR_RETRIEVER, useClass: AtlasVectorRetriever },
  ],
  exports: [TextChunker, VECTOR_RETRIEVER],
})
export class KnowledgeRagModule {}
