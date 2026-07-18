import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { StreamAssistantReplyModule } from '../stream-assistant-reply/stream-assistant-reply.module.js'
import { SendMessageOrchestrator } from './send-message.orchestrator.js'

@Module({
  imports: [ConversationsModule, MessagesModule, StreamAssistantReplyModule],
  providers: [SendMessageOrchestrator],
  exports: [SendMessageOrchestrator],
})
export class SendMessageModule {}
