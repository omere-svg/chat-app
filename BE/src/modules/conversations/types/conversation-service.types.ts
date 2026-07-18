import type { ConversationType } from './conversation.entity.js'

export interface CreateConversationRecordInput {
  type?: ConversationType
  title: string
  participantIds: string[]
}

export interface ParticipantConversationQuery {
  conversationId: string
  userId: string
}
