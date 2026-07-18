import type { MessageCitation, MessageRecord } from './message.entity.js'
import type { SendMessageDto } from '../DTO/send-message.dto.js'

export interface MessagePageResponse {
  messages: MessageRecord[]
  nextCursor: string | null
}

export interface CreateMessageInput {
  senderId: string
  conversationId: string
  sendMessageDto: SendMessageDto
}

export interface CreateAssistantReplyInput {
  conversationId: string
  body: string
  replyToMessageId: string
  citations?: MessageCitation[]
}
