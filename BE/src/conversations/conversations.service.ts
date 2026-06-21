import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { CONVERSATION_REPOSITORY } from './repository/conversation-repository.port.js'
import type { ConversationRepository } from './repository/conversation-repository.port.js'
import type { ConversationLastMessage, ConversationRecord } from './conversation.entity.js'

export interface CreateConversationRecordInput {
  title: string
  participantIds: string[]
}

export interface ParticipantConversationQuery {
  conversationId: string
  userId: string
}

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: ConversationRepository,
  ) {}

  listForParticipant(userId: string): Promise<ConversationRecord[]> {
    return this.conversationRepository.findByParticipantSortedByActivity(userId)
  }

  async getParticipantConversationOrThrow({
    conversationId,
    userId,
  }: ParticipantConversationQuery): Promise<ConversationRecord> {
    const conversation = await this.conversationRepository.findById(conversationId)
    if (conversation === null) {
      throw new NotFoundException({
        code: ERROR_CODES.CONVERSATION_NOT_FOUND,
        message: 'Conversation not found',
      })
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'You are not a participant in this conversation',
      })
    }

    return conversation
  }

  async create({ title, participantIds }: CreateConversationRecordInput): Promise<ConversationRecord> {
    const existingConversation = await this.conversationRepository.findByParticipantSet(participantIds)
    if (existingConversation !== null) {
      throw new ConflictException({
        code: ERROR_CODES.CONVERSATION_CONFLICT,
        message: 'A conversation with these participants already exists',
        details: { conversationId: existingConversation.id },
      })
    }

    const createdAt = new Date().toISOString()
    const conversation: ConversationRecord = {
      id: `conv-${randomUUID()}`,
      title,
      participantIds,
      // Seed lastActivityAt to createdAt so a brand-new, empty conversation still
      // sorts by recency on the (participantIds, lastActivityAt) index.
      lastActivityAt: createdAt,
      lastMessage: null,
      createdAt,
    }

    return this.conversationRepository.insert(conversation)
  }

  advanceLastMessageIfNewer(conversationId: string, lastMessage: ConversationLastMessage): Promise<void> {
    return this.conversationRepository.advanceLastMessageIfNewer(conversationId, lastMessage)
  }
}
