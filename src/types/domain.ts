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

export type ConversationPreview = {
  id: string
  title: string
  participantIds: string[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string
}

/** Optimistic message in flight; presence in `pending` means it is sending. */
export type PendingMessage = Message & {
  clientMessageId: string
}
