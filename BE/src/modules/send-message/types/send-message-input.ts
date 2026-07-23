import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'
import type { SendMessageDto } from '../../messages/DTO/send-message.dto.js'

export interface SendMessageInput {
  senderId: string
  conversationId: string
  sendMessageDto: SendMessageDto
  simulateFailureRequested: boolean
}

export interface SendMessageRequestInput {
  senderId: string
  conversation: ConversationRecord
  sendMessageDto: SendMessageDto
  simulateFailureHeader: string | undefined
}
