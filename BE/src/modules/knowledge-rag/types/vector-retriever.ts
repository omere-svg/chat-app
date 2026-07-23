import type { RetrievedChunk } from '../../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'
import type { RetrieveSimilarParams } from '../../../modules/knowledge-chunk/types/retrieve-similar-params.js'

export type { RetrieveSimilarParams }

export interface VectorRetriever {
  retrieveSimilarForUser(params: RetrieveSimilarParams): Promise<RetrievedChunk[]>
}
