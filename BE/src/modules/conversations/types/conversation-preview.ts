import type { ConversationLastMessage, ConversationType } from './conversation.entity.js'

export interface ConversationPreview {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastMessage: ConversationLastMessage | null
  updatedAt: string
}
