import { Injectable } from '@nestjs/common'
import { KnowledgeChunkService } from '../../../modules/knowledge-chunk/knowledge-chunk.service.js'
import type { RetrievedChunk } from '../../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'
import type { RetrieveSimilarParams, VectorRetriever } from '../types/vector-retriever.js'

@Injectable()
export class AtlasVectorRetriever implements VectorRetriever {
  constructor(private readonly knowledgeChunkService: KnowledgeChunkService) {}

  retrieveSimilarForUser(params: RetrieveSimilarParams): Promise<RetrievedChunk[]> {
    return this.knowledgeChunkService.retrieveSimilarForUser(params)
  }
}
