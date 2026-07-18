import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'
import type { SendMessageDto } from '../../messages/DTO/send-message.dto.js'
import type { AssistantStreamEvent } from './assistant-stream-event.js'

export interface StreamAssistantReplyInput {
  userId: string
  conversation: ConversationRecord
  sendMessageDto: SendMessageDto
  signal: AbortSignal
  emit: (event: AssistantStreamEvent) => void
}

export interface StreamAssistantReplyToResponseInput {
  userId: string
  conversation: ConversationRecord
  sendMessageDto: SendMessageDto
}
