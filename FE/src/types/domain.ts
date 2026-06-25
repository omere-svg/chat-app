export type User = {
  id: string
  email?: string
  displayName: string
  avatarUrl?: string
}

// 'direct' is human-to-human; 'assistant' is an AI chat. 'tutor' is reserved for a
// later (RAG) week and is not produced yet.
export type ConversationType = 'direct' | 'assistant' | 'tutor'

// Reserved sender id the backend uses for AI replies; never equals a real user id.
export const ASSISTANT_SENDER_ID = 'assistant'

export type MessageMetadata = {
  replyToMessageId?: string
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  metadata?: MessageMetadata
}

export type ConversationPreview = {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string
}

export type PendingMessage = Message & {
  clientMessageId: string
}

// The assistant reply as it streams in, before the final persisted Message arrives.
// A stream failure clears the streaming message entirely (it never carries an error
// state), so the only live status is 'streaming'.
// `annotations` is the open seam for tool/citation UI in later weeks.
export type StreamingMessage = Message & {
  status: 'streaming'
  annotations?: { tools?: string[] }
}

export type ThreadMessage = Message | PendingMessage | StreamingMessage
