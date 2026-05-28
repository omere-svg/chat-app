import type { ConversationPreview, Message, User } from './domain.ts'

export type LoginRequest = {
  userId: string
}

export type LoginResponse = {
  token: string
  user: User
}

export type ConversationsResponse = {
  conversations: ConversationPreview[]
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
