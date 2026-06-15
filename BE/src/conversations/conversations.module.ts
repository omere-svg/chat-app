import { Module } from '@nestjs/common'
import { ConversationsService } from './conversations.service.js'
import { InMemoryConversationRepository } from './repository/in-memory-conversation.repository.js'
import { CONVERSATION_REPOSITORY } from './repository/conversation-repository.port.js'

@Module({
  providers: [
    ConversationsService,
    { provide: CONVERSATION_REPOSITORY, useClass: InMemoryConversationRepository },
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}
