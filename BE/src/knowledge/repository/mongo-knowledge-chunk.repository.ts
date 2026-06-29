import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { KnowledgeChunkDocument } from '../knowledge-chunk.schema.js'
import type { KnowledgeChunkRepository } from './knowledge-chunk-repository.port.js'
import type { KnowledgeChunkRecord } from '../knowledge-chunk.entity.js'

@Injectable()
export class MongoKnowledgeChunkRepository implements KnowledgeChunkRepository {
  constructor(
    @InjectModel(KnowledgeChunkDocument.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
  ) {}

  async insertMany(chunks: KnowledgeChunkRecord[]): Promise<void> {
    if (chunks.length === 0) {
      return
    }
    await this.chunkModel.insertMany(
      chunks.map((chunk) => ({
        _id: chunk.id,
        userId: chunk.userId,
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding: chunk.embedding,
      })),
    )
  }

  async deleteByDocumentForUser(userId: string, documentId: string): Promise<number> {
    const result = await this.chunkModel.deleteMany({ userId, documentId })
    return result.deletedCount ?? 0
  }
}
