import { Injectable } from '@nestjs/common'
import { MessagesService } from '../messages/messages.service.js'
import type { MessagePageResponse } from '../messages/types/message-service.types.js'
import type { ListMessagesQueryDto } from '../messages/DTO/list-messages-query.dto.js'

@Injectable()
export class ListMessagesOrchestrator {
  constructor(private readonly messagesService: MessagesService) {}

  list(conversationId: string, query: ListMessagesQueryDto): Promise<MessagePageResponse> {
    return this.messagesService.listMessages(conversationId, {
      cursor: query.cursor,
      limit: query.limit,
    })
  }
}
