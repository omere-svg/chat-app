import { Injectable } from '@nestjs/common'
import { MessagesService } from '../../messages/messages.service.js'
import type { MessagePageResponse } from '../../messages/messages.service.js'
import type { ListMessagesQueryDto } from '../../messages/dto/list-messages-query.dto.js'

@Injectable()
export class ListMessagesOrchestrator {
  constructor(private readonly messagesService: MessagesService) {}

  list(conversationId: string, query: ListMessagesQueryDto): Promise<MessagePageResponse> {
    return this.messagesService.listMessages(conversationId, query)
  }
}
