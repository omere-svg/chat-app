import type { ConversationPreview, Message, User } from './domain.ts'

export type KnowledgeDocument = {
  id: string
  filename: string
  status: 'ready' | 'failed'
  chunkCount: number
  byteSize: number
  createdAt: string
}

export type KnowledgeDocumentsResponse = {
  documents: KnowledgeDocument[]
}

export type UploadKnowledgeDocumentResponse = {
  document: KnowledgeDocument
}

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
  // Defaults to 'direct' server-side. 'assistant' and 'tutor' conversations need no
  // participants — the creator is the sole member.
  type?: 'direct' | 'assistant' | 'tutor'
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
