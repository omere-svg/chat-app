import type { MessageCitation, MessageRecord } from './message.entity.js'

export interface MessagePageResponse {
  messages: MessageRecord[]
  nextCursor: string | null
}

export interface ListMessagesInput {
  cursor?: string
  limit?: number
}

export interface CreateMessageInput {
  senderId: string
  conversationId: string
  body: string
  clientMessageId?: string
}

export interface CreateAssistantReplyInput {
  conversationId: string
  body: string
  replyToMessageId: string
  citations?: MessageCitation[]
}
