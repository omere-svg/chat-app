import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { MESSAGE_REPOSITORY } from './message.repository.js'
import { ASSISTANT_SENDER_ID, DEFAULT_MESSAGE_PAGE_SIZE } from './constants.js'
import { InvalidCursorError } from './errors/invalid-cursor.error.js'
import type { MessageRepository } from './message.repository.js'
import type { MessageMetadata, MessageRecord } from './types/message.entity.js'
import type {
  CreateAssistantReplyInput,
  CreateMessageInput,
  ListMessagesInput,
  MessagePageResponse,
} from './types/message-service.types.js'

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: MessageRepository,
  ) {}

  async seedIfEmpty(messages: readonly MessageRecord[]): Promise<number> {
    if (!(await this.messageRepository.isEmpty())) {
      return 0
    }

    for (const message of messages) {
      await this.messageRepository.insert(message)
    }
    return messages.length
  }

  async listMessages(
    conversationId: string,
    { cursor, limit }: ListMessagesInput,
  ): Promise<MessagePageResponse> {
    const pageSize = limit ?? DEFAULT_MESSAGE_PAGE_SIZE
    const result = await this.messageRepository.findMessagePage(conversationId, cursor, pageSize)

    if (result.outcome === 'invalid-cursor') {
      throw new InvalidCursorError()
    }

    return { messages: result.page.items, nextCursor: result.page.nextCursor }
  }

  async createMessage({
    senderId,
    conversationId,
    body,
    clientMessageId,
  }: CreateMessageInput): Promise<MessageRecord> {
    if (clientMessageId !== undefined) {
      const alreadySentMessage = await this.messageRepository.findByClientMessageId(
        conversationId,
        clientMessageId,
      )
      if (alreadySentMessage !== null) {
        return alreadySentMessage
      }
    }

    const message: MessageRecord = {
      id: `msg-${randomUUID()}`,
      conversationId,
      senderId,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }

    return this.messageRepository.insert(message, clientMessageId)
  }

  async listRecentMessagesOldestFirst(
    conversationId: string,
    limit: number,
  ): Promise<MessageRecord[]> {
    const result = await this.messageRepository.findMessagePage(conversationId, undefined, limit)
    return result.outcome === 'page' ? result.page.items : []
  }

  findAssistantReplyTo(conversationId: string, userMessageId: string): Promise<MessageRecord | null> {
    return this.messageRepository.findAssistantReplyTo(conversationId, userMessageId)
  }

  searchMessagesAuthoredByUser(
    userId: string,
    query: string,
    limit: number,
  ): Promise<MessageRecord[]> {
    return this.messageRepository.searchAuthoredByUser(userId, query, limit)
  }

  createAssistantReply({
    conversationId,
    body,
    replyToMessageId,
    citations,
  }: CreateAssistantReplyInput): Promise<MessageRecord> {
    const metadata: MessageMetadata = { replyToMessageId }
    if (citations !== undefined && citations.length > 0) {
      metadata.citations = citations
    }

    const message: MessageRecord = {
      id: `msg-${randomUUID()}`,
      conversationId,
      senderId: ASSISTANT_SENDER_ID,
      body,
      createdAt: new Date().toISOString(),
      metadata,
    }

    return this.messageRepository.insert(message)
  }
}
