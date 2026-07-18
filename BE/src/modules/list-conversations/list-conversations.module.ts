import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { UsersModule } from '../users/users.module.js'
import { ConversationParticipantsModule } from '../../shared/conversation-participants/conversation-participants.module.js'
import { ListConversationsOrchestrator } from './list-conversations.orchestrator.js'

@Module({
  imports: [ConversationsModule, UsersModule, ConversationParticipantsModule],
  providers: [ListConversationsOrchestrator],
  exports: [ListConversationsOrchestrator],
})
export class ListConversationsModule {}
