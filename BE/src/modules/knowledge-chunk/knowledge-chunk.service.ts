import { Inject, Injectable } from '@nestjs/common'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './knowledge-chunk.repository.js'
import type { KnowledgeChunkRepository } from './knowledge-chunk.repository.js'
import type { KnowledgeChunkRecord, RetrievedChunk } from './types/knowledge-chunk.entity.js'
import type { RetrieveSimilarParams } from './types/retrieve-similar-params.js'

@Injectable()
export class KnowledgeChunkService {
  constructor(
    @Inject(KNOWLEDGE_CHUNK_REPOSITORY)
    private readonly chunkRepository: KnowledgeChunkRepository,
  ) {}

  insertMany(chunks: KnowledgeChunkRecord[]): Promise<void> {
    return this.chunkRepository.insertMany(chunks)
  }

  deleteByDocumentForUser(userId: string, documentId: string): Promise<number> {
    return this.chunkRepository.deleteByDocumentForUser(userId, documentId)
  }

  async retrieveSimilarForUser({
    userId,
    queryEmbedding,
    limit,
    minScore,
  }: RetrieveSimilarParams): Promise<RetrievedChunk[]> {
    const chunks = await this.chunkRepository.searchSimilarForUser({ userId, queryEmbedding, limit })
    return chunks.filter((chunk) => chunk.score >= minScore)
  }
}
