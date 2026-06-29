import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, PipelineStage } from 'mongoose'
import { KnowledgeChunkDocument } from '../knowledge-chunk.schema.js'
import { buildUserScopedVectorSearchPipeline } from './atlas-vector-search.query.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { RetrievedChunk } from '../knowledge-chunk.entity.js'
import type { RetrieveSimilarParams, VectorRetriever } from './vector-retriever.port.js'

// ANN candidate pool relative to the requested top-K. Atlas requires numCandidates to
// exceed `limit`; a 10x pool trades a little latency for materially better recall.
const CANDIDATE_POOL_MULTIPLIER = 10

interface VectorSearchHit {
  _id: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  score: number
}

@Injectable()
export class AtlasVectorRetriever implements VectorRetriever {
  private readonly indexName: string

  constructor(
    @InjectModel(KnowledgeChunkDocument.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    configService: ConfigService<AppEnvironment, true>,
  ) {
    this.indexName = configService.get('ATLAS_VECTOR_INDEX', { infer: true })
  }

  async retrieveSimilarForUser({
    userId,
    queryEmbedding,
    limit,
    minScore,
  }: RetrieveSimilarParams): Promise<RetrievedChunk[]> {
    const pipeline = buildUserScopedVectorSearchPipeline({
      indexName: this.indexName,
      userId,
      queryEmbedding,
      limit,
      numCandidates: limit * CANDIDATE_POOL_MULTIPLIER,
    })

    // Our pipeline uses the Atlas-only $vectorSearch stage, which is outside Mongoose's
    // PipelineStage union; the cast is over a value we constructed ourselves, not over
    // external input.
    const hits = await this.chunkModel.aggregate<VectorSearchHit>(
      pipeline as unknown as PipelineStage[],
    )

    return hits
      .filter((hit) => hit.score >= minScore)
      .map((hit) => ({
        id: hit._id,
        documentId: hit.documentId,
        documentName: hit.documentName,
        chunkIndex: hit.chunkIndex,
        text: hit.text,
        score: hit.score,
      }))
  }
}
