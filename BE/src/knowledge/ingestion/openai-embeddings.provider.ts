import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { EmbeddingsProvider } from './embeddings.port.js'

// OpenAI-backed embeddings via LangChain's OpenAIEmbeddings. The model (default
// text-embedding-3-small, 1536 dims) must match the Atlas vector index's numDimensions.
@Injectable()
export class OpenAiEmbeddingsProvider implements EmbeddingsProvider {
  private readonly embeddings: OpenAIEmbeddings

  constructor(configService: ConfigService<AppEnvironment, true>) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: configService.get('OPENAI_API_KEY', { infer: true }),
      model: configService.get('EMBEDDINGS_MODEL', { infer: true }),
    })
  }

  embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts)
  }

  embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text)
  }
}
