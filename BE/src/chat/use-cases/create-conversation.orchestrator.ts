import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { UsersService } from '../../users/users.service.js'
import { ConversationParticipantsMapper } from '../mapper/conversation-participants.mapper.js'
import { toConversationPreview } from '../conversation-preview-view.js'
import {
  DEFAULT_ASSISTANT_CONVERSATION_TITLE,
  DEFAULT_TUTOR_CONVERSATION_TITLE,
} from '../../conversations/conversation.entity.js'
import type { ConversationPreview } from '../conversation-preview-view.js'
import type { CreateConversationDto } from '../../conversations/dto/create-conversation.dto.js'

@Injectable()
export class CreateConversationOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
    private readonly participantsMapper: ConversationParticipantsMapper,
  ) {}

  async create(
    creatorUserId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationPreview> {
    const invitedParticipants = await this.usersService.resolveExistingUsersByEmails(
      createConversationDto.participantEmails,
    )

    const creator = await this.usersService.findPublicUserById(creatorUserId)
    if (creator === null) {
      throw new UnauthorizedException({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Authenticated user could not be found',
      })
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
    return toConversationPreview(conversation)
  }

  // An assistant conversation is private to its creator: the creator is the sole
  // participant and there are no invitees to resolve.
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

  // A tutor conversation is, like an assistant conversation, private to its creator and
  // carries no invitees. It answers from the creator's own knowledge base.
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
    const trimmedTitle = requestedTitle?.trim()
    const conversation = await this.conversationsService.create({
      type,
      title:
        trimmedTitle !== undefined && trimmedTitle.length > 0 ? trimmedTitle : defaultTitle,
      participantIds: [creatorUserId],
    })
    return toConversationPreview(conversation)
  }
}
