import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { MESSAGE_REPOSITORY } from './repository/message-repository.port.js'
import { ASSISTANT_SENDER_ID } from './message.entity.js'
import type { MessageRepository } from './repository/message-repository.port.js'
import type { MessageCitation, MessageMetadata, MessageRecord } from './message.entity.js'
import type { ListMessagesQueryDto } from './dto/list-messages-query.dto.js'
import type { SendMessageDto } from './dto/send-message.dto.js'

const DEFAULT_MESSAGE_PAGE_SIZE = 50

export interface MessagePageResponse {
  messages: MessageRecord[]
  nextCursor: string | null
}

export interface CreateMessageInput {
  senderId: string
  conversationId: string
  sendMessageDto: SendMessageDto
}

export interface CreateAssistantReplyInput {
  conversationId: string
  body: string
  // The user message this reply answers; lets a retry replay it idempotently.
  replyToMessageId: string
  // Source chunks a tutor reply was grounded in. Omitted for plain assistant replies.
  citations?: MessageCitation[]
}

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: MessageRepository,
  ) {}

  async listMessages(
    conversationId: string,
    query: ListMessagesQueryDto,
  ): Promise<MessagePageResponse> {
    const limit = query.limit ?? DEFAULT_MESSAGE_PAGE_SIZE
    const result = await this.messageRepository.findMessagePage(conversationId, query.cursor, limit)

    if (result.outcome === 'invalid-cursor') {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_CURSOR,
        message: 'Pagination cursor is invalid or expired',
      })
    }

    return { messages: result.page.items, nextCursor: result.page.nextCursor }
  }

  async createMessage({
    senderId,
    conversationId,
    sendMessageDto,
  }: CreateMessageInput): Promise<MessageRecord> {
    if (sendMessageDto.clientMessageId !== undefined) {
      const alreadySentMessage = await this.messageRepository.findByClientMessageId(
        conversationId,
        sendMessageDto.clientMessageId,
      )
      if (alreadySentMessage !== null) {
        return alreadySentMessage
      }
    }

    const message: MessageRecord = {
      id: `msg-${randomUUID()}`,
      conversationId,
      senderId,
      body: sendMessageDto.body.trim(),
      createdAt: new Date().toISOString(),
    }

    return this.messageRepository.insert(message, sendMessageDto.clientMessageId)
  }

  // Returns the most recent `limit` messages oldest-first — the order an LLM
  // expects conversation history in.
  async listRecentMessagesOldestFirst(
    conversationId: string,
    limit: number,
  ): Promise<MessageRecord[]> {
    const result = await this.messageRepository.findMessagePage(conversationId, undefined, limit)
    return result.outcome === 'page' ? result.page.items : []
  }

  // The assistant reply already generated for a user message, if one was persisted.
  findAssistantReplyTo(conversationId: string, userMessageId: string): Promise<MessageRecord | null> {
    return this.messageRepository.findAssistantReplyTo(conversationId, userMessageId)
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
