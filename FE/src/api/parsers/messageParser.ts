import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord, readNumber, readOptionalString, readString } from './primitives.ts'
import type { MessagesResponse, SendMessageResponse } from '../../types/api.ts'
import type { Citation, Message, MessageMetadata } from '../../types/domain.ts'

export function parseCitation(value: unknown, context: string): Citation {
  if (!isRecord(value)) {
    throw new MalformedResponseError(context)
  }
  return {
    chunkId: readString(value, 'chunkId', context),
    documentId: readString(value, 'documentId', context),
    documentName: readString(value, 'documentName', context),
    text: readString(value, 'text', context),
    score: readNumber(value, 'score', context),
  }
}

function parseCitations(value: unknown): Citation[] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!Array.isArray(value)) {
    throw new MalformedResponseError('message.metadata.citations')
  }
  return value.map((entry, index) =>
    parseCitation(entry, `message.metadata.citations[${index}]`),
  )
}

function parseMessageMetadata(value: unknown): MessageMetadata | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (!isRecord(value)) {
    throw new MalformedResponseError('message.metadata')
  }
  const replyToMessageId = readOptionalString(value, 'replyToMessageId', 'message.metadata')
  const citations = parseCitations(value.citations)
  if (replyToMessageId === undefined && citations === undefined) {
    return undefined
  }
  const metadata: MessageMetadata = {}
  if (replyToMessageId !== undefined) {
    metadata.replyToMessageId = replyToMessageId
  }
  if (citations !== undefined) {
    metadata.citations = citations
  }
  return metadata
}

function parseMessage(value: unknown): Message {
  if (!isRecord(value)) {
    throw new MalformedResponseError('message')
  }
  const message: Message = {
    id: readString(value, 'id', 'message'),
    conversationId: readString(value, 'conversationId', 'message'),
    senderId: readString(value, 'senderId', 'message'),
    body: readString(value, 'body', 'message'),
    createdAt: readString(value, 'createdAt', 'message'),
  }
  const metadata = parseMessageMetadata(value.metadata)
  if (metadata !== undefined) {
    message.metadata = metadata
  }
  return message
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
