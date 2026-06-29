import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module.js'
import { KnowledgeController } from './knowledge.controller.js'
import { KnowledgeService } from './knowledge.service.js'
import { TextChunker } from './ingestion/text-chunker.js'
import { OpenAiEmbeddingsProvider } from './ingestion/openai-embeddings.provider.js'
import { EMBEDDINGS_PROVIDER } from './ingestion/embeddings.port.js'
import { AtlasVectorRetriever } from './retrieval/atlas-vector.retriever.js'
import { VECTOR_RETRIEVER } from './retrieval/vector-retriever.port.js'
import { TutorReplyStrategy, TUTOR_REPLY_STRATEGY } from './tutor/tutor-reply.strategy.js'
import { KnowledgeDocumentDocument, KnowledgeDocumentSchema } from './knowledge-document.schema.js'
import { KnowledgeChunkDocument, KnowledgeChunkSchema } from './knowledge-chunk.schema.js'
import { KNOWLEDGE_DOCUMENT_REPOSITORY } from './repository/knowledge-document-repository.port.js'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './repository/knowledge-chunk-repository.port.js'
import { MongoKnowledgeDocumentRepository } from './repository/mongo-knowledge-document.repository.js'
import { MongoKnowledgeChunkRepository } from './repository/mongo-knowledge-chunk.repository.js'

// The knowledge / RAG bounded context: document ingestion + endpoints, embeddings, the
// user-scoped vector retriever, and the tutor reply strategy. The strategy is exported
// so the assistant module can register it in the reply-strategy registry; tests can
// override TUTOR_REPLY_STRATEGY with a fake so no LLM or Atlas call is made.
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: KnowledgeDocumentDocument.name, schema: KnowledgeDocumentSchema },
      { name: KnowledgeChunkDocument.name, schema: KnowledgeChunkSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    TextChunker,
    { provide: KNOWLEDGE_DOCUMENT_REPOSITORY, useClass: MongoKnowledgeDocumentRepository },
    { provide: KNOWLEDGE_CHUNK_REPOSITORY, useClass: MongoKnowledgeChunkRepository },
    { provide: EMBEDDINGS_PROVIDER, useClass: OpenAiEmbeddingsProvider },
    { provide: VECTOR_RETRIEVER, useClass: AtlasVectorRetriever },
    { provide: TUTOR_REPLY_STRATEGY, useClass: TutorReplyStrategy },
  ],
  exports: [TUTOR_REPLY_STRATEGY],
})
export class KnowledgeModule {}
