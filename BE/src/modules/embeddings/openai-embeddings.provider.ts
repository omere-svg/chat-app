import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { EmbeddingsProvider } from './types/embeddings-provider.js'

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
