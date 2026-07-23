import type { SearchSimilarParams } from './search-similar-params.js'

export interface RetrieveSimilarParams extends SearchSimilarParams {
  minScore: number
}
