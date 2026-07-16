import { Injectable } from '@nestjs/common'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { UsersService } from '../../users/users.service.js'
import { ConversationParticipantsMapper } from '../mapper/conversation-participants.mapper.js'
import { toConversationPreview } from '../conversation-preview-view.js'
import type { ConversationPreview } from '../conversation-preview-view.js'
import type { PublicUser } from '../../users/user-public-view.js'

@Injectable()
export class ListConversationsOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
    private readonly participantsMapper: ConversationParticipantsMapper,
  ) {}

  async listForUser(userId: string): Promise<ConversationPreview[]> {
    // The repository returns conversations already sorted by last activity via the
    // (participantIds, lastActivityAt) index, with the last-message snapshot embedded.
    const conversations = await this.conversationsService.listForParticipant(userId)

    // Direct-conversation titles are derived from participants' names. We recompute them
    // here from the *current* profiles so a name change is reflected immediately, rather
    // than showing the stale snapshot stored when the conversation was created.
    const usersById = await this.resolveDirectParticipants(conversations)

    return conversations.map((conversation) => {
      const preview = toConversationPreview(conversation)
      if (conversation.type !== 'direct') {
        return preview
      }

      const participants = conversation.participantIds
        .map((participantId) => usersById.get(participantId))
        .filter((participant): participant is PublicUser => participant !== undefined)

      // Only override when every participant resolved; otherwise keep the stored title so
      // a since-deleted account can't collapse the title into a partial name.
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
