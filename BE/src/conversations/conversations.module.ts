import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { UsersModule } from '../users/users.module.js'
import { ConversationsController } from './conversations.controller.js'
import { ConversationsService } from './conversations.service.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { InMemoryConversationRepository } from './repository/in-memory-conversation.repository.js'
import { InMemoryMessageRepository } from './repository/in-memory-message.repository.js'
import { MessagesController } from './messages.controller.js'
import { MessagesService } from './messages.service.js'
import { CONVERSATION_REPOSITORY } from './repository/conversation-repository.port.js'
import { MESSAGE_REPOSITORY } from './repository/message-repository.port.js'

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ConversationsController, MessagesController],
  providers: [
    ConversationsService,
    MessagesService,
    ConversationParticipantGuard,
    { provide: CONVERSATION_REPOSITORY, useClass: InMemoryConversationRepository },
    { provide: MESSAGE_REPOSITORY, useClass: InMemoryMessageRepository },
  ],
})
export class ConversationsModule {}
