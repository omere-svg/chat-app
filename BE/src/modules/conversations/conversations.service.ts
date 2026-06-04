import { randomUUID } from 'node:crypto'
import { store } from '../../data/store.js'
import { ApiError } from '../../shared/ApiError.js'
import type { Conversation, ConversationPreview } from '../../domain/types.js'
import type { CreateConversationInput } from './conversations.schemas.js'

export function listForUser(userId: string): ConversationPreview[] {
  return [...store.conversations.values()]
    .filter((conversation) => conversation.participantIds.includes(userId))
    .map(toPreview)
    .sort((a, b) => compareDescending(a.updatedAt, b.updatedAt))
}

export function create(
  creatorUserId: string,
  input: CreateConversationInput,
): ConversationPreview {
  const participantIds = normalizeParticipants(creatorUserId, input.participantIds)
  assertParticipantsExist(participantIds)

  const existing = findByParticipantSet(participantIds)
  if (existing) {
    throw ApiError.conversationConflict(existing.id)
  }

  const conversation: Conversation = {
    id: `conv-${randomUUID()}`,
    title: input.title ?? buildTitleFromParticipants(participantIds),
    participantIds,
    createdAt: new Date().toISOString(),
  }

  store.conversations.set(conversation.id, conversation)
  store.messagesByConversationId.set(conversation.id, [])

  return toPreview(conversation)
}

export function getConversationOrThrow(conversationId: string): Conversation {
  const conversation = store.conversations.get(conversationId)
  if (!conversation) {
    throw ApiError.conversationNotFound()
  }
  return conversation
}

export function assertParticipant(conversation: Conversation, userId: string): void {
  if (!conversation.participantIds.includes(userId)) {
    throw ApiError.forbidden()
  }
}

function toPreview(conversation: Conversation): ConversationPreview {
  const messages = store.messagesByConversationId.get(conversation.id) ?? []
  const lastMessage = messages.at(-1) ?? null

  return {
    id: conversation.id,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastMessage: lastMessage
      ? {
          body: lastMessage.body,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
        }
      : null,
    updatedAt: lastMessage?.createdAt ?? conversation.createdAt,
  }
}

function normalizeParticipants(creatorUserId: string, otherIds: string[]): string[] {
  return [...new Set([creatorUserId, ...otherIds])].sort()
}

function assertParticipantsExist(participantIds: string[]): void {
  const unknownIds = participantIds.filter((id) => !store.users.has(id))
  if (unknownIds.length > 0) {
    throw ApiError.validation('One or more participants do not exist', { unknownIds })
  }
}

function findByParticipantSet(participantIds: string[]): Conversation | undefined {
  return [...store.conversations.values()].find((conversation) =>
    sameParticipantSet(conversation.participantIds, participantIds),
  )
}

function sameParticipantSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((value, index) => value === sortedB[index])
}

function buildTitleFromParticipants(participantIds: string[]): string {
  return participantIds
    .map((id) => store.users.get(id)?.displayName ?? id)
    .join(' & ')
}

function compareDescending(a: string, b: string): number {
  if (a < b) return 1
  if (a > b) return -1
  return 0
}
