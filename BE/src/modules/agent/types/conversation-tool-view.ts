import type { ConversationType } from '../../conversations/types/conversation.entity.js'

export interface ConversationToolView {
  id: string
  type: ConversationType
  title: string
  updatedAt: string
  lastMessageSnippet: string | null
}
