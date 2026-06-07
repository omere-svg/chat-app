export type User = {
  id: string
  displayName: string
  avatarUrl?: string
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export type Conversation = {
  id: string
  title: string
  participantIds: string[]
  createdAt: string
}

export type ConversationPreview = {
  id: string
  title: string
  participantIds: string[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string
}
