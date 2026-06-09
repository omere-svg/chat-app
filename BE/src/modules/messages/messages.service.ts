import { randomUUID } from 'node:crypto'
import { store } from '../../data/store.js'
import { compareByCreatedAtAsc } from '../../shared/ordering.js'
import * as conversationsService from '../conversations/conversations.service.js'
import { paginateMessages } from './messages.pagination.js'
import type { MessagePage } from './messages.pagination.js'
import type { Message } from '../../domain/types.js'
import type { ListMessagesQuery, SendMessageInput } from './messages.schemas.js'

export function listMessages(
  userId: string,
  conversationId: string,
  query: ListMessagesQuery,
): MessagePage {
  const conversation = conversationsService.getConversationOrThrow(conversationId)
  conversationsService.assertParticipant(conversation, userId)

  const messages = store.messagesByConversationId.get(conversationId) ?? []
  return paginateMessages(messages, query.cursor, query.limit)
}

export function createMessage(
  userId: string,
  conversationId: string,
  input: SendMessageInput,
): Message {
  const conversation = conversationsService.getConversationOrThrow(conversationId)
  conversationsService.assertParticipant(conversation, userId)

  if (input.clientMessageId !== undefined) {
    const alreadySent = findByClientMessageId(conversationId, input.clientMessageId)
    if (alreadySent) {
      return alreadySent
    }
  }

  const message: Message = {
    id: `msg-${randomUUID()}`,
    conversationId,
    senderId: userId,
    body: input.body,
    createdAt: new Date().toISOString(),
  }

  const messages = store.messagesByConversationId.get(conversationId) ?? []
  messages.push(message)
  messages.sort(compareByCreatedAtAsc)
  store.messagesByConversationId.set(conversationId, messages)

  if (input.clientMessageId !== undefined) {
    rememberClientMessageId(conversationId, input.clientMessageId, message.id)
  }

  return message
}

function findByClientMessageId(
  conversationId: string,
  clientMessageId: string,
): Message | undefined {
  const messageId = store.messageIdByClientId.get(conversationId)?.get(clientMessageId)
  if (messageId === undefined) {
    return undefined
  }
  const messages = store.messagesByConversationId.get(conversationId) ?? []
  return messages.find((message) => message.id === messageId)
}

function rememberClientMessageId(
  conversationId: string,
  clientMessageId: string,
  messageId: string,
): void {
  const index = store.messageIdByClientId.get(conversationId) ?? new Map<string, string>()
  index.set(clientMessageId, messageId)
  store.messageIdByClientId.set(conversationId, index)
}
