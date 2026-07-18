export type ConversationType = 'direct' | 'assistant' | 'tutor'

export interface ConversationLastMessage {
  body: string
  senderId: string
  createdAt: string
}

export interface ConversationRecord {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastActivityAt: string
  lastMessage: ConversationLastMessage | null
  createdAt: string
}
