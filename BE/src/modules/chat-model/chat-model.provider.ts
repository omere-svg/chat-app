import { ChatOpenAI } from '@langchain/openai'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../config/environment.types.js'

export function createChatModel(configService: ConfigService<AppEnvironment, true>): ChatOpenAI {
  return new ChatOpenAI({
    apiKey: configService.get('OPENAI_API_KEY', { infer: true }),
    model: configService.get('ASSISTANT_MODEL', { infer: true }),
    maxTokens: configService.get('ASSISTANT_MAX_TOKENS', { infer: true }),
  })
}
