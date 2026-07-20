import { Injectable } from '@nestjs/common'
import { CreatorNotFoundError } from './errors/creator-not-found.error.js'
import { ConversationsService } from '../conversations/conversations.service.js'
import { UsersService } from '../users/users.service.js'
import { ConversationParticipantsMapper } from '../../shared/conversation-participants/conversation-participants.mapper.js'
import {
  toConversationParticipantView,
  toConversationPreview,
} from '../conversations/conversation.mapper.js'
import {
  DEFAULT_ASSISTANT_CONVERSATION_TITLE,
  DEFAULT_TUTOR_CONVERSATION_TITLE,
} from '../conversations/constants.js'
import type { ConversationRecord } from '../conversations/types/conversation.entity.js'
import type { ConversationPreview } from '../conversations/types/conversation-preview.js'
import type { CreateConversationDto } from '../conversations/DTO/create-conversation.dto.js'
import type { User } from '../users/types/user.js'

@Injectable()
export class CreateConversationOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
    private readonly participantsMapper: ConversationParticipantsMapper,
  ) {}

  createFromDto(
    creatorUserId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationPreview> {
    switch (createConversationDto.type) {
      case 'assistant':
        return this.createAssistant(creatorUserId, createConversationDto.title)
      case 'tutor':
        return this.createTutor(creatorUserId, createConversationDto.title)
      default:
        return this.create(creatorUserId, createConversationDto)
    }
  }

  async create(
    creatorUserId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationPreview> {
    const invitedParticipants = await this.usersService.resolveExistingUsersByEmails(
      createConversationDto.participantEmails,
    )

    const creator = await this.usersService.findUserById(creatorUserId)
    if (creator === null) {
      throw new CreatorNotFoundError()
    }

    const { title, participantIds } = this.participantsMapper.shape(
      creator,
      invitedParticipants,
      createConversationDto.title,
    )

    const conversation = await this.conversationsService.create({
      type: 'direct',
      title,
      participantIds,
    })
    return this.buildPreview(conversation, [creator, ...invitedParticipants])
  }

  async createAssistant(
    creatorUserId: string,
    requestedTitle: string | undefined,
  ): Promise<ConversationPreview> {
    return this.createPrivateAiConversation(
      creatorUserId,
      'assistant',
      requestedTitle,
      DEFAULT_ASSISTANT_CONVERSATION_TITLE,
    )
  }

  async createTutor(
    creatorUserId: string,
    requestedTitle: string | undefined,
  ): Promise<ConversationPreview> {
    return this.createPrivateAiConversation(
      creatorUserId,
      'tutor',
      requestedTitle,
      DEFAULT_TUTOR_CONVERSATION_TITLE,
    )
  }

  private async createPrivateAiConversation(
    creatorUserId: string,
    type: 'assistant' | 'tutor',
    requestedTitle: string | undefined,
    defaultTitle: string,
  ): Promise<ConversationPreview> {
    const creator = await this.usersService.findUserById(creatorUserId)
    if (creator === null) {
      throw new CreatorNotFoundError()
    }

    const trimmedTitle = requestedTitle?.trim()
    const conversation = await this.conversationsService.create({
      type,
      title:
        trimmedTitle !== undefined && trimmedTitle.length > 0 ? trimmedTitle : defaultTitle,
      participantIds: [creatorUserId],
    })
    return this.buildPreview(conversation, [creator])
  }

  private buildPreview(
    conversation: ConversationRecord,
    knownUsers: readonly User[],
  ): ConversationPreview {
    const usersById = new Map<string, User>()
    for (const user of knownUsers) {
      usersById.set(user.id, user)
    }

    const participants = conversation.participantIds
      .map((participantId) => usersById.get(participantId))
      .filter((participant): participant is User => participant !== undefined)
      .map(toConversationParticipantView)

    return toConversationPreview(conversation, participants)
  }
}
