import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { UsersModule } from '../users/users.module.js'
import { ChatOrchestrator } from './chat.orchestrator.js'
import { ConversationsController } from './conversations.controller.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { MessagesController } from './messages.controller.js'

@Module({
  imports: [AuthModule, UsersModule, ConversationsModule, MessagesModule],
  controllers: [ConversationsController, MessagesController],
  providers: [ChatOrchestrator, ConversationParticipantGuard],
})
export class ChatModule {}
