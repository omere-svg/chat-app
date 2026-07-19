export type User = {
  id: string
  email?: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
}

export type ConversationParticipant = {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
}

export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}

export type ConversationType = 'direct' | 'assistant' | 'tutor'

export const ASSISTANT_SENDER_ID = 'assistant'

export const ASSISTANT_DISPLAY_NAME = 'Assistant'

export type Citation = {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score: number
}

export type MessageMetadata = {
  replyToMessageId?: string
  citations?: Citation[]
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
  participants: ConversationParticipant[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string
}

export type PendingMessage = Message & {
  clientMessageId: string
}

export type StreamingMessage = Message & {
  status: 'streaming'
  annotations?: { tools?: string[]; completedTools?: string[]; citations?: Citation[] }
}

export type ThreadMessage = Message | PendingMessage | StreamingMessage
