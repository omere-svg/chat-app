import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, PipelineStage } from 'mongoose'
import { buildUserScopedVectorSearchPipeline } from './atlas-vector-search.query.js'
import { CANDIDATE_POOL_MULTIPLIER } from './constants.js'
import { KnowledgeChunkDocument } from './knowledge-chunk.schema.js'
import type { KnowledgeChunkRepository } from './knowledge-chunk.repository.js'
import type { KnowledgeChunkRecord, RetrievedChunk } from './types/knowledge-chunk.entity.js'
import type { SearchSimilarParams } from './types/search-similar-params.js'
import type { VectorSearchHit } from './types/vector-search-pipeline.js'
import type { AppEnvironment } from '../../config/environment.types.js'

@Injectable()
export class MongoKnowledgeChunkRepository implements KnowledgeChunkRepository {
  private readonly indexName: string

  constructor(
    @InjectModel(KnowledgeChunkDocument.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    configService: ConfigService<AppEnvironment, true>,
  ) {
    this.indexName = configService.get('ATLAS_VECTOR_INDEX', { infer: true })
  }

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

  async searchSimilarForUser({
    userId,
    queryEmbedding,
    limit,
  }: SearchSimilarParams): Promise<RetrievedChunk[]> {
    const pipeline = buildUserScopedVectorSearchPipeline({
      indexName: this.indexName,
      userId,
      queryEmbedding,
      limit,
      numCandidates: limit * CANDIDATE_POOL_MULTIPLIER,
    })

    const hits = await this.chunkModel.aggregate<VectorSearchHit>(
      pipeline as unknown as PipelineStage[],
    )

    return hits.map((hit) => ({
      id: hit._id,
      documentId: hit.documentId,
      documentName: hit.documentName,
      chunkIndex: hit.chunkIndex,
      text: hit.text,
      score: hit.score,
    }))
  }
}
