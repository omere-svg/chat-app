import { Module } from '@nestjs/common'
import { EMBEDDINGS_PROVIDER } from './embeddings.tokens.js'
import { OpenAiEmbeddingsProvider } from './openai-embeddings.provider.js'

@Module({
  providers: [{ provide: EMBEDDINGS_PROVIDER, useClass: OpenAiEmbeddingsProvider }],
  exports: [EMBEDDINGS_PROVIDER],
})
export class EmbeddingsModule {}
