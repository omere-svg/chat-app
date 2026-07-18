import { Inject, Injectable } from '@nestjs/common'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './knowledge-chunk.repository.js'
import type { KnowledgeChunkRepository } from './knowledge-chunk.repository.js'
import type { KnowledgeChunkRecord } from './types/knowledge-chunk.entity.js'

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
}
