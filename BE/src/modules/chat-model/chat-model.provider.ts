import { ChatOpenAI } from '@langchain/openai'
import {
  ASSISTANT_MAX_TOKENS_CONFIG_KEY,
  ASSISTANT_MODEL_CONFIG_KEY,
  OPENAI_API_KEY_CONFIG_KEY,
} from './constants.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../config/environment.types.js'

export function createChatModel(configService: ConfigService<AppEnvironment, true>): ChatOpenAI {
  return new ChatOpenAI({
    apiKey: configService.get(OPENAI_API_KEY_CONFIG_KEY, { infer: true }),
    model: configService.get(ASSISTANT_MODEL_CONFIG_KEY, { infer: true }),
    maxTokens: configService.get(ASSISTANT_MAX_TOKENS_CONFIG_KEY, { infer: true }),
  })
}
