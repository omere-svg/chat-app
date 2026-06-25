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
import {
  DEFAULT_ASSISTANT_CONVERSATION_TITLE,
  DEFAULT_CONVERSATION_TYPE,
} from './conversation.entity.js'
import type { ConversationRepository } from './repository/conversation-repository.port.js'
import type {
  ConversationLastMessage,
  ConversationRecord,
  ConversationType,
} from './conversation.entity.js'

export interface CreateConversationRecordInput {
  type?: ConversationType
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

  async create({
    type = DEFAULT_CONVERSATION_TYPE,
    title,
    participantIds,
  }: CreateConversationRecordInput): Promise<ConversationRecord> {
    // Assistant conversations are private to a single user, so several can coexist
    // with the same participant set — the one-conversation-per-participant-set rule
    // only applies to human ('direct') conversations.
    if (type === 'direct') {
      const existingConversation = await this.conversationRepository.findByParticipantSet(participantIds)
      if (existingConversation !== null) {
        throw new ConflictException({
          code: ERROR_CODES.CONVERSATION_CONFLICT,
          message: 'A conversation with these participants already exists',
          details: { conversationId: existingConversation.id },
        })
      }
    }

    const createdAt = new Date().toISOString()
    const conversation: ConversationRecord = {
      id: `conv-${randomUUID()}`,
      type,
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

  // Names an assistant conversation from a user message while it still carries the
  // default placeholder title; a no-op once it has been renamed. Caveat: a title the
  // caller explicitly set to the default string would also be replaced on the next
  // message — acceptable today since no caller passes a custom title.
  setTitleIfStillDefault(conversationId: string, title: string): Promise<void> {
    return this.conversationRepository.setTitleIfCurrentTitleMatches(
      conversationId,
      title,
      DEFAULT_ASSISTANT_CONVERSATION_TITLE,
    )
  }
}
