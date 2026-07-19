import type { ConversationLastMessage, ConversationType } from './conversation.entity.js'
import type { ConversationParticipantView } from './conversation-participant-view.js'

export interface ConversationPreview {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  participants: ConversationParticipantView[]
  lastMessage: ConversationLastMessage | null
  updatedAt: string
}
