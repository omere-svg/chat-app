import { Injectable } from '@nestjs/common'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { MessagesService } from '../../messages/messages.service.js'
import { toConversationPreview } from '../conversation-preview-view.js'
import type { ConversationPreview } from '../conversation-preview-view.js'

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
export class ListConversationsOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  async listForUser(userId: string): Promise<ConversationPreview[]> {
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
}
