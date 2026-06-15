import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { ConversationsService } from '../conversations/conversations.service.js'
import { MessagesService } from '../messages/messages.service.js'
import { UsersService } from '../users/users.service.js'
import { toConversationPreview } from './conversation-preview-view.js'
import type { ConversationPreview } from './conversation-preview-view.js'
import type { CreateConversationDto } from '../conversations/dto/create-conversation.dto.js'
import type { PublicUser } from '../users/user-public-view.js'

function compareUpdatedAtDescending(first: string, second: string): number {
  if (first < second) {
    return 1
  }
  if (first > second) {
    return -1
  }
  return 0
}

function compareByIdAscending(first: PublicUser, second: PublicUser): number {
  if (first.id < second.id) {
    return -1
  }
  if (first.id > second.id) {
    return 1
  }
  return 0
}

@Injectable()
export class ChatOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  async listConversationsForUser(userId: string): Promise<ConversationPreview[]> {
    const conversations = await this.conversationsService.listForParticipant(userId)
    const latestByConversationId = await this.messagesService.findLatestByConversationIds(
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

    const participantsById = new Map<string, PublicUser>()
    for (const participant of [creator, ...invitedParticipants]) {
      participantsById.set(participant.id, participant)
    }
    const participants = [...participantsById.values()].sort(compareByIdAscending)

    const title =
      createConversationDto.title === undefined
        ? participants.map((participant) => participant.displayName).join(' & ')
        : createConversationDto.title.trim()

    const conversation = await this.conversationsService.create({
      title,
      participantIds: participants.map((participant) => participant.id),
    })
    return toConversationPreview(conversation, null)
  }
}
