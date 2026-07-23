import { Injectable } from '@nestjs/common'
import { ConversationsService } from '../conversations/conversations.service.js'
import { UsersService } from '../users/users.service.js'
import { ConversationParticipantsMapper } from '../../shared/conversation-participants/conversation-participants.mapper.js'
import {
  buildConversationPreview,
  resolveConversationParticipants,
} from '../conversations/conversation-preview.helper.js'
import type { ConversationPreview } from '../conversations/types/conversation-preview.js'
import type { ConversationRecord } from '../conversations/types/conversation.entity.js'
import type { User } from '../users/types/user.js'

@Injectable()
export class ListConversationsOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
    private readonly participantsMapper: ConversationParticipantsMapper,
  ) {}

  async listForUser(userId: string): Promise<ConversationPreview[]> {
    const conversations = await this.conversationsService.listForParticipant(userId)
    const usersById = await this.resolveParticipants(conversations)

    return conversations.map((conversation) =>
      this.buildPreview(conversation, usersById),
    )
  }

  private buildPreview(
    conversation: ConversationRecord,
    usersById: Map<string, User>,
  ): ConversationPreview {
    const participants = resolveConversationParticipants(conversation, usersById)
    const preview = buildConversationPreview(conversation, participants)

    if (
      conversation.type === 'direct' &&
      participants.length === conversation.participantIds.length
    ) {
      preview.title = this.participantsMapper.deriveTitle(participants)
    }
    return preview
  }

  private async resolveParticipants(
    conversations: readonly ConversationRecord[],
  ): Promise<Map<string, User>> {
    const participantIds = new Set<string>()
    for (const conversation of conversations) {
      for (const participantId of conversation.participantIds) {
        participantIds.add(participantId)
      }
    }

    const usersById = new Map<string, User>()
    if (participantIds.size === 0) {
      return usersById
    }

    const users = await this.usersService.findUsersByIds([...participantIds])
    for (const user of users) {
      usersById.set(user.id, user)
    }
    return usersById
  }
}
