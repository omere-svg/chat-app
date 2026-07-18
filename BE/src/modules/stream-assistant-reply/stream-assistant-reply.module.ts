import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { AgentModule } from '../agent/agent.module.js'
import { StreamAssistantReplyOrchestrator } from './stream-assistant-reply.orchestrator.js'

@Module({
  imports: [ConversationsModule, MessagesModule, AgentModule],
  providers: [StreamAssistantReplyOrchestrator],
  exports: [StreamAssistantReplyOrchestrator],
})
export class StreamAssistantReplyModule {}
