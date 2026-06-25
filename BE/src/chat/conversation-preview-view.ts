import type {
  ConversationLastMessage,
  ConversationRecord,
  ConversationType,
} from '../conversations/conversation.entity.js'

export interface ConversationPreview {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastMessage: ConversationLastMessage | null
  updatedAt: string
}

export function toConversationPreview(conversation: ConversationRecord): ConversationPreview {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.lastActivityAt,
  }
}
