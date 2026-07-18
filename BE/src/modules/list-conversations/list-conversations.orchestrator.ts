import { Injectable } from '@nestjs/common'
import { ConversationsService } from '../conversations/conversations.service.js'
import { UsersService } from '../users/users.service.js'
import { ConversationParticipantsMapper } from '../../shared/conversation-participants/conversation-participants.mapper.js'
import { toConversationPreview } from '../conversations/conversation.mapper.js'
import type { ConversationPreview } from '../conversations/types/conversation-preview.js'
import type { PublicUser } from '../users/types/user-public-view.js'

@Injectable()
export class ListConversationsOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
    private readonly participantsMapper: ConversationParticipantsMapper,
  ) {}

  async listForUser(userId: string): Promise<ConversationPreview[]> {
    const conversations = await this.conversationsService.listForParticipant(userId)

    const usersById = await this.resolveDirectParticipants(conversations)

    return conversations.map((conversation) => {
      const preview = toConversationPreview(conversation)
      if (conversation.type !== 'direct') {
        return preview
      }

      const participants = conversation.participantIds
        .map((participantId) => usersById.get(participantId))
        .filter((participant): participant is PublicUser => participant !== undefined)

      if (participants.length === conversation.participantIds.length) {
        preview.title = this.participantsMapper.deriveTitle(participants)
      }
      return preview
    })
  }

  private async resolveDirectParticipants(
    conversations: readonly { type: string; participantIds: string[] }[],
  ): Promise<Map<string, PublicUser>> {
    const participantIds = new Set<string>()
    for (const conversation of conversations) {
      if (conversation.type === 'direct') {
        for (const participantId of conversation.participantIds) {
          participantIds.add(participantId)
        }
      }
    }

    const usersById = new Map<string, PublicUser>()
    if (participantIds.size === 0) {
      return usersById
    }

    const users = await this.usersService.findPublicUsersByIds([...participantIds])
    for (const user of users) {
      usersById.set(user.id, user)
    }
    return usersById
  }
}
