import { Injectable, Logger } from '@nestjs/common'
import type { OnModuleInit } from '@nestjs/common'
import { paginateByCursor } from '../../shared/pagination/cursor-pagination.js'
import { CHAT_SEED } from '../../shared/seed/chat-seed.js'
import { compareMessagesByCreatedAtAscending } from '../message-ordering.js'
import type { CursorPageResult } from '../../shared/pagination/cursor-pagination.js'
import type { MessageRepository } from './message-repository.port.js'
import type { MessageRecord } from '../message.entity.js'

@Injectable()
export class InMemoryMessageRepository implements MessageRepository, OnModuleInit {
  private readonly logger = new Logger(InMemoryMessageRepository.name)
  private readonly messagesByConversationId = new Map<string, MessageRecord[]>()
  private readonly messageIdByClientKey = new Map<string, Map<string, string>>()

  onModuleInit(): void {
    let seededMessageCount = 0
    for (const [conversationId, messages] of CHAT_SEED.messagesByConversationId) {
      const orderedMessages = [...messages].sort(compareMessagesByCreatedAtAscending)
      this.messagesByConversationId.set(conversationId, orderedMessages)
      seededMessageCount += orderedMessages.length
    }
    this.logger.log(`Seeded ${seededMessageCount.toString()} demo messages`)
  }

  findMessagePage(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<CursorPageResult<MessageRecord>> {
    const orderedMessages = this.messagesByConversationId.get(conversationId) ?? []
    const result = paginateByCursor(orderedMessages, cursor, limit)

    if (result.outcome === 'invalid-cursor') {
      return Promise.resolve(result)
    }

    return Promise.resolve({
      outcome: 'page',
      page: {
        items: result.page.items.map((message) => ({ ...message })),
        nextCursor: result.page.nextCursor,
      },
    })
  }

  findLatestByConversationIds(
    conversationIds: readonly string[],
  ): Promise<ReadonlyMap<string, MessageRecord>> {
    const latestByConversationId = new Map<string, MessageRecord>()

    for (const conversationId of conversationIds) {
      const latestMessage = this.messagesByConversationId.get(conversationId)?.at(-1)
      if (latestMessage !== undefined) {
        latestByConversationId.set(conversationId, { ...latestMessage })
      }
    }

    return Promise.resolve(latestByConversationId)
  }

  findByClientMessageId(
    conversationId: string,
    clientMessageId: string,
  ): Promise<MessageRecord | null> {
    const messageId = this.messageIdByClientKey.get(conversationId)?.get(clientMessageId)
    if (messageId === undefined) {
      return Promise.resolve(null)
    }

    const storedMessage = this.messagesByConversationId
      .get(conversationId)
      ?.find((message) => message.id === messageId)
    return Promise.resolve(storedMessage === undefined ? null : { ...storedMessage })
  }

  insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord> {
    const storedMessage: MessageRecord = { ...message }
    const conversationMessages = this.messagesByConversationId.get(message.conversationId) ?? []
    conversationMessages.push(storedMessage)
    conversationMessages.sort(compareMessagesByCreatedAtAscending)
    this.messagesByConversationId.set(message.conversationId, conversationMessages)

    if (clientMessageId !== undefined) {
      this.rememberClientMessageId(message.conversationId, clientMessageId, storedMessage.id)
    }

    return Promise.resolve({ ...storedMessage })
  }

  private rememberClientMessageId(
    conversationId: string,
    clientMessageId: string,
    messageId: string,
  ): void {
    const clientKeyIndex =
      this.messageIdByClientKey.get(conversationId) ?? new Map<string, string>()
    clientKeyIndex.set(clientMessageId, messageId)
    this.messageIdByClientKey.set(conversationId, clientKeyIndex)
  }
}
