import { Injectable } from '@nestjs/common'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { toConversationPreview } from '../conversation-preview-view.js'
import type { ConversationPreview } from '../conversation-preview-view.js'

@Injectable()
export class ListConversationsOrchestrator {
  constructor(private readonly conversationsService: ConversationsService) {}

  async listForUser(userId: string): Promise<ConversationPreview[]> {
    // The repository returns conversations already sorted by last activity via the
    // (participantIds, lastMessageAt) index, with the last-message snapshot embedded.
    const conversations = await this.conversationsService.listForParticipant(userId)
    return conversations.map(toConversationPreview)
  }
}
