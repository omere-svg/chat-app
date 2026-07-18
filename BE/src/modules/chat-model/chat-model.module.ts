import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatOpenAI } from '@langchain/openai'
import { CHAT_MODEL } from './chat-model.tokens.js'
import { createChatModel } from './chat-model.provider.js'
import type { AppEnvironment } from '../../config/environment.types.js'

@Module({
  providers: [
    {
      provide: CHAT_MODEL,
      useFactory: (configService: ConfigService<AppEnvironment, true>): ChatOpenAI =>
        createChatModel(configService),
      inject: [ConfigService],
    },
  ],
  exports: [CHAT_MODEL],
})
export class ChatModelModule {}
