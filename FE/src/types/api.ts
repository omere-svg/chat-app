import type { ConversationPreview, Message, Plan, Subscription, User } from './domain.ts'
import type {
  EMAIL_CHANGE_REQUEST_STATUS,
  PASSWORD_RESET_CONFIRM_STATUS,
  PASSWORD_RESET_REQUEST_STATUS,
} from '../api/constants.ts'

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
  firstName: string
  lastName: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type UpdateProfileRequest = {
  firstName: string
  lastName: string
}

export type RequestEmailChangeRequest = {
  newEmail: string
}

export type RequestEmailChangeResult = {
  status: typeof EMAIL_CHANGE_REQUEST_STATUS
}

export type ConfirmEmailChangeRequest = {
  token: string
}

export type ConfirmEmailChangeResponse = User & {
  email: string
}

export type PreviousEmailsResponse = {
  previousEmails: string[]
}

export type RequestPasswordResetRequest = {
  email: string
}

export type RequestPasswordResetResult = {
  status: typeof PASSWORD_RESET_REQUEST_STATUS
}

export type ConfirmPasswordResetRequest = {
  email: string
  code: string
  newPassword: string
}

export type ConfirmPasswordResetResult = {
  status: typeof PASSWORD_RESET_CONFIRM_STATUS
}

export type ListPlansResult = {
  plans: Plan[]
}

export type GetSubscriptionResult = Subscription

export type CreatePaymentSessionRequest = {
  planCode: string
}

export type CreatePaymentSessionResult = {
  checkoutUrl: string
}

export type RequestAvatarUploadRequest = {
  contentType: string
}

export type AvatarUploadTicket = {
  url: string
  fields: Record<string, string>
  key: string
  expiresInSeconds: number
}

export type AvatarResult = {
  avatarUrl: string | null
}

export type AuthResponse = {
  token: string
  user: User
}

export type ConversationsResponse = {
  conversations: ConversationPreview[]
}

export type CreateConversationRequest = {
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
