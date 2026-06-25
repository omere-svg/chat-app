import type { ConversationPreview, Message, User } from './domain.ts'

export type SignupRequest = {
  email: string
  password: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type ConversationsResponse = {
  conversations: ConversationPreview[]
}

export type CreateConversationRequest = {
  // Defaults to 'direct' server-side. An 'assistant' conversation needs no participants.
  type?: 'direct' | 'assistant'
  participantEmails?: string[]
  title?: string
}

export type CreateConversationResponse = {
  conversation: ConversationPreview
}

export type MessagesResponse = {
  messages: Message[]
  nextCursor: string | null
}

export type SendMessageRequest = {
  body: string
  clientMessageId?: string
}

export type SendMessageResponse = {
  message: Message
}

export type ApiErrorPayload = {
  code: string
  message: string
  details?: unknown
}

export type ApiErrorBody = {
  error: ApiErrorPayload
}
