import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord, readNullableString, readString, readStringArray } from './primitives.ts'
import type {
  ConversationsResponse,
  CreateConversationResponse,
} from '../../types/api.ts'
import type {
  ConversationParticipant,
  ConversationPreview,
  ConversationType,
} from '../../types/domain.ts'

const CONVERSATION_TYPES: readonly ConversationType[] = ['direct', 'assistant', 'tutor']

function parseParticipant(value: unknown, context: string): ConversationParticipant {
  if (!isRecord(value)) {
    throw new MalformedResponseError(context)
  }
  return {
    id: readString(value, 'id', context),
    firstName: readString(value, 'firstName', context),
    lastName: readString(value, 'lastName', context),
    avatarUrl: readNullableString(value, 'avatarUrl', context),
  }
}

function parseParticipants(value: unknown): ConversationParticipant[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new MalformedResponseError('conversation.participants')
  }
  return value.map((entry, index) =>
    parseParticipant(entry, `conversation.participants[${index}]`),
  )
}

function parseConversationLastMessage(value: unknown): ConversationPreview['lastMessage'] {
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

function readConversationType(value: Record<string, unknown>): ConversationType {
  const candidate = value.type
  return CONVERSATION_TYPES.includes(candidate as ConversationType)
    ? (candidate as ConversationType)
    : 'direct'
}

function parseConversationPreview(value: unknown): ConversationPreview {
  if (!isRecord(value)) {
    throw new MalformedResponseError('conversation')
  }
  return {
    id: readString(value, 'id', 'conversation'),
    type: readConversationType(value),
    title: readString(value, 'title', 'conversation'),
    participantIds: readStringArray(value, 'participantIds', 'conversation'),
    participants: parseParticipants(value.participants),
    lastMessage: parseConversationLastMessage(value.lastMessage),
    updatedAt: readString(value, 'updatedAt', 'conversation'),
  }
}

export function parseConversationsResponse(value: unknown): ConversationsResponse {
  if (!isRecord(value) || !Array.isArray(value.conversations)) {
    throw new MalformedResponseError('conversationsResponse.conversations')
  }
  return { conversations: value.conversations.map(parseConversationPreview) }
}

export function parseCreateConversationResponse(value: unknown): CreateConversationResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('createConversationResponse')
  }
  return { conversation: parseConversationPreview(value.conversation) }
}
