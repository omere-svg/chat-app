import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { UsersService } from '../users/users.service.js'
import { toConversationPreview } from './conversation-preview-view.js'
import { CONVERSATION_REPOSITORY } from './repository/conversation-repository.port.js'
import { MESSAGE_REPOSITORY } from './repository/message-repository.port.js'
import type { ConversationRepository } from './repository/conversation-repository.port.js'
import type { MessageRepository } from './repository/message-repository.port.js'
import type { ConversationPreview } from './conversation-preview-view.js'
import type { ConversationRecord } from './conversation.entity.js'
import type { PublicUser } from '../users/user-public-view.js'
import type { CreateConversationDto } from './dto/create-conversation.dto.js'

function normalizeParticipantIds(creatorUserId: string, otherParticipantIds: string[]): string[] {
  return [...new Set([creatorUserId, ...otherParticipantIds])].sort()
}

function compareUpdatedAtDescending(first: string, second: string): number {
  if (first < second) {
    return 1
  }
  if (first > second) {
    return -1
  }
  return 0
}

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: ConversationRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService,
  ) {}

  async listConversationsForUser(userId: string): Promise<ConversationPreview[]> {
    const conversations = await this.conversationRepository.findByParticipant(userId)
    const latestByConversationId = await this.messageRepository.findLatestByConversationIds(
      conversations.map((conversation) => conversation.id),
    )

    return conversations
      .map((conversation) =>
        toConversationPreview(conversation, latestByConversationId.get(conversation.id) ?? null),
      )
      .sort((first, second) => compareUpdatedAtDescending(first.updatedAt, second.updatedAt))
  }

  async createConversation(
    creatorUserId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationPreview> {
    const invitedParticipantIds = await this.resolveParticipantIdsByEmail(
      createConversationDto.participantEmails,
    )
    const participantIds = normalizeParticipantIds(creatorUserId, invitedParticipantIds)
    const participants = await this.loadExistingParticipants(participantIds)

    const existingConversation = await this.conversationRepository.findByParticipantSet(participantIds)
    if (existingConversation !== null) {
      throw new ConflictException({
        code: ERROR_CODES.CONVERSATION_CONFLICT,
        message: 'A conversation with these participants already exists',
        details: { conversationId: existingConversation.id },
      })
    }

    const title =
      createConversationDto.title === undefined
        ? participants.map((participant) => participant.displayName).join(' & ')
        : createConversationDto.title.trim()

    const conversation: ConversationRecord = {
      id: `conv-${randomUUID()}`,
      title,
      participantIds,
      createdAt: new Date().toISOString(),
    }

    const insertedConversation = await this.conversationRepository.insert(conversation)
    return toConversationPreview(insertedConversation, null)
  }

  async assertParticipantConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationRecord> {
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

  private async resolveParticipantIdsByEmail(emails: readonly string[]): Promise<string[]> {
    const lookups = await Promise.all(
      emails.map((email) => this.usersService.findPublicUserByEmail(email)),
    )

    const unknownEmails = emails.filter((_, index) => lookups[index] === null)
    if (unknownEmails.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User with this email does not exist',
        details: { unknownEmails },
      })
    }

    return lookups
      .filter((user): user is PublicUser => user !== null)
      .map((user) => user.id)
  }

  private async loadExistingParticipants(participantIds: readonly string[]): Promise<PublicUser[]> {
    const lookups = await Promise.all(
      participantIds.map((participantId) => this.usersService.findPublicUserById(participantId)),
    )

    const unknownParticipantIds = participantIds.filter((_, index) => lookups[index] === null)
    if (unknownParticipantIds.length > 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'One or more participants do not exist',
        details: { unknownParticipantIds },
      })
    }

    return lookups.filter((user): user is PublicUser => user !== null)
  }
}
