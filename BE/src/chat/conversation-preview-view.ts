import type {
  ConversationLastMessage,
  ConversationRecord,
} from '../conversations/conversation.entity.js'

export interface ConversationPreview {
  id: string
  title: string
  participantIds: string[]
  lastMessage: ConversationLastMessage | null
  updatedAt: string
}

export function toConversationPreview(conversation: ConversationRecord): ConversationPreview {
  return {
    id: conversation.id,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.lastMessageAt,
  }
}
