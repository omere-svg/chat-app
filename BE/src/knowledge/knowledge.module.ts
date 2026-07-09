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
import { KnowledgeDocumentDocument, KnowledgeDocumentSchema } from './knowledge-document.schema.js'
import { KnowledgeChunkDocument, KnowledgeChunkSchema } from './knowledge-chunk.schema.js'
import { KNOWLEDGE_DOCUMENT_REPOSITORY } from './repository/knowledge-document-repository.port.js'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './repository/knowledge-chunk-repository.port.js'
import { MongoKnowledgeDocumentRepository } from './repository/mongo-knowledge-document.repository.js'
import { MongoKnowledgeChunkRepository } from './repository/mongo-knowledge-chunk.repository.js'

// The knowledge / RAG bounded context: document ingestion + endpoints, embeddings, and
// the user-scoped vector retriever. The embeddings provider and retriever are exported so
// the agent's `retrieve` node can ground answers; tests override EMBEDDINGS_PROVIDER with
// a fake so no OpenAI or Atlas call is made.
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
  ],
  exports: [EMBEDDINGS_PROVIDER, VECTOR_RETRIEVER],
})
export class KnowledgeModule {}
