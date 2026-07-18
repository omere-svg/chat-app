import type { ConversationPreview } from '../../conversations/types/conversation-preview.js'

export interface ConversationListResponse {
  conversations: ConversationPreview[]
}

export interface ConversationCreatedResponse {
  conversation: ConversationPreview
}
