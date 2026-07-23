import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { CONVERSATION_REPOSITORY } from './conversation.repository.js'
import {
  DEFAULT_ASSISTANT_CONVERSATION_TITLE,
  DEFAULT_CONVERSATION_TYPE,
} from './constants.js'
import { ConversationNotFoundError } from './errors/conversation-not-found.error.js'
import { NotAParticipantError } from './errors/not-a-participant.error.js'
import { ConversationConflictError } from './errors/conversation-conflict.error.js'
import type { ConversationRepository } from './conversation.repository.js'
import type {
  ConversationLastMessage,
  ConversationRecord,
} from './types/conversation.entity.js'
import type {
  CreateConversationRecordInput,
  ParticipantConversationQuery,
} from './types/conversation-service.types.js'

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: ConversationRepository,
  ) {}

  async seedIfEmpty(conversations: readonly ConversationRecord[]): Promise<number> {
    if (!(await this.conversationRepository.isEmpty())) {
      return 0
    }

    for (const conversation of conversations) {
      await this.conversationRepository.insert(conversation)
    }
    return conversations.length
  }

  listForParticipant(userId: string): Promise<ConversationRecord[]> {
    return this.conversationRepository.findByParticipantSortedByActivity(userId)
  }

  async getParticipantConversationOrThrow({
    conversationId,
    userId,
  }: ParticipantConversationQuery): Promise<ConversationRecord> {
    const conversation = await this.conversationRepository.findById(conversationId)
    if (conversation === null) {
      throw new ConversationNotFoundError()
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new NotAParticipantError()
    }

    return conversation
  }

  async create({
    type = DEFAULT_CONVERSATION_TYPE,
    title,
    participantIds,
  }: CreateConversationRecordInput): Promise<ConversationRecord> {
    if (type === 'direct') {
      const existingConversation = await this.conversationRepository.findByExactParticipants(participantIds)
      if (existingConversation !== null) {
        throw new ConversationConflictError(existingConversation.id)
      }
    }

    const createdAt = new Date().toISOString()
    const conversation: ConversationRecord = {
      id: `conv-${randomUUID()}`,
      type,
      title,
      participantIds,
      lastActivityAt: createdAt,
      lastMessage: null,
      createdAt,
    }

    return this.conversationRepository.insert(conversation)
  }

  advanceLastMessageIfNewer(conversationId: string, lastMessage: ConversationLastMessage): Promise<void> {
    return this.conversationRepository.advanceLastMessageIfNewer(conversationId, lastMessage)
  }

  setTitleIfStillDefault(conversationId: string, title: string): Promise<void> {
    return this.conversationRepository.setTitleIfCurrentTitleMatches(
      conversationId,
      title,
      DEFAULT_ASSISTANT_CONVERSATION_TITLE,
    )
  }
}
