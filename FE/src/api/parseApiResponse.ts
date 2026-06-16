import type {
  AuthResponse,
  ConversationsResponse,
  CreateConversationResponse,
  MessagesResponse,
  SendMessageResponse,
} from '../types/api.ts'
import type { ConversationPreview, Message, User } from '../types/domain.ts'

export class MalformedResponseError extends Error {
  constructor(field: string) {
    super(`Malformed server response at ${field}`)
    this.name = 'MalformedResponseError'
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string {
  const value = record[field]
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readOptionalString(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string | undefined {
  const value = record[field]
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== 'string') {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value
}

function readStringArray(
  record: Record<string, unknown>,
  field: string,
  context: string,
): string[] {
  const value = record[field]
  if (!Array.isArray(value)) {
    throw new MalformedResponseError(`${context}.${field}`)
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string') {
      throw new MalformedResponseError(`${context}.${field}[${index}]`)
    }
    return entry
  })
}

function parseUser(value: unknown): User {
  if (!isRecord(value)) {
    throw new MalformedResponseError('user')
  }
  return {
    id: readString(value, 'id', 'user'),
    displayName: readString(value, 'displayName', 'user'),
    email: readOptionalString(value, 'email', 'user'),
    avatarUrl: readOptionalString(value, 'avatarUrl', 'user'),
  }
}

function parseMessage(value: unknown): Message {
  if (!isRecord(value)) {
    throw new MalformedResponseError('message')
  }
  return {
    id: readString(value, 'id', 'message'),
    conversationId: readString(value, 'conversationId', 'message'),
    senderId: readString(value, 'senderId', 'message'),
    body: readString(value, 'body', 'message'),
    createdAt: readString(value, 'createdAt', 'message'),
  }
}

function parseConversationLastMessage(
  value: unknown,
): ConversationPreview['lastMessage'] {
  if (value === null) {
    return null
  }
  if (!isRecord(value)) {
    throw new MalformedResponseError('conversation.lastMessage')
  }
  return {
    body: readString(value, 'body', 'conversation.lastMessage'),
    createdAt: readString(value, 'createdAt', 'conversation.lastMessage'),
    senderId: readString(value, 'senderId', 'conversation.lastMessage'),
  }
}

function parseConversationPreview(value: unknown): ConversationPreview {
  if (!isRecord(value)) {
    throw new MalformedResponseError('conversation')
  }
  return {
    id: readString(value, 'id', 'conversation'),
    title: readString(value, 'title', 'conversation'),
    participantIds: readStringArray(value, 'participantIds', 'conversation'),
    lastMessage: parseConversationLastMessage(value.lastMessage),
    updatedAt: readString(value, 'updatedAt', 'conversation'),
  }
}

export function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('authResponse')
  }
  return {
    token: readString(value, 'token', 'authResponse'),
    user: parseUser(value.user),
  }
}

export function parseUserResponse(value: unknown): User {
  return parseUser(value)
}

export function parseConversationsResponse(
  value: unknown,
): ConversationsResponse {
  if (!isRecord(value) || !Array.isArray(value.conversations)) {
    throw new MalformedResponseError('conversationsResponse.conversations')
  }
  return { conversations: value.conversations.map(parseConversationPreview) }
}

export function parseCreateConversationResponse(
  value: unknown,
): CreateConversationResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('createConversationResponse')
  }
  return { conversation: parseConversationPreview(value.conversation) }
}

export function parseMessagesResponse(value: unknown): MessagesResponse {
  if (!isRecord(value) || !Array.isArray(value.messages)) {
    throw new MalformedResponseError('messagesResponse.messages')
  }
  const nextCursor = value.nextCursor
  if (nextCursor !== null && typeof nextCursor !== 'string') {
    throw new MalformedResponseError('messagesResponse.nextCursor')
  }
  return { messages: value.messages.map(parseMessage), nextCursor }
}

export function parseSendMessageResponse(value: unknown): SendMessageResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('sendMessageResponse')
  }
  return { message: parseMessage(value.message) }
}
