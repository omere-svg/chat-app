import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { UsersModule } from '../users/users.module.js'
import { ConversationsController } from './conversations.controller.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { MessagesController } from './messages.controller.js'
import { ConversationParticipantsMapper } from './mapper/conversation-participants.mapper.js'
import { CreateConversationOrchestrator } from './use-cases/create-conversation.orchestrator.js'
import { ListConversationsOrchestrator } from './use-cases/list-conversations.orchestrator.js'
import { ListMessagesOrchestrator } from './use-cases/list-messages.orchestrator.js'
import { SendMessageOrchestrator } from './use-cases/send-message.orchestrator.js'

@Module({
  imports: [AuthModule, UsersModule, ConversationsModule, MessagesModule],
  controllers: [ConversationsController, MessagesController],
  providers: [
    ListConversationsOrchestrator,
    CreateConversationOrchestrator,
    SendMessageOrchestrator,
    ListMessagesOrchestrator,
    ConversationParticipantsMapper,
    ConversationParticipantGuard,
  ],
})
export class ChatModule {}
