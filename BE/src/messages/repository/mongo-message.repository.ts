import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, QueryFilter } from 'mongoose'
import { MessageDocument } from '../message.schema.js'
import { toMessageRecord } from '../message.mapper.js'
import { isDuplicateKeyError } from '../../shared/database/mongo-errors.js'
import type { CursorPageResult } from '../../shared/pagination/cursor-page.js'
import type { MessageRepository } from './message-repository.port.js'
import type { MessageRecord } from '../message.entity.js'

@Injectable()
export class MongoMessageRepository implements MessageRepository {
  constructor(
    @InjectModel(MessageDocument.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  async isEmpty(): Promise<boolean> {
    return (await this.messageModel.countDocuments({})) === 0
  }

  async findMessagePage(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<CursorPageResult<MessageRecord>> {
    const filter: QueryFilter<MessageDocument> = { conversationId }

    if (cursor !== undefined) {
      const cursorMessage = await this.messageModel
        .findOne({ _id: cursor, conversationId })
        .lean<MessageDocument | null>()
      if (cursorMessage === null) {
        return { outcome: 'invalid-cursor' }
      }
      // Walk strictly older than the cursor in the (createdAt, _id) total order.
      filter.$or = [
        { createdAt: { $lt: cursorMessage.createdAt } },
        { createdAt: cursorMessage.createdAt, _id: { $lt: cursorMessage._id } },
      ]
    }

    // Over-fetch by one to tell whether an older page exists without a count query.
    const newestFirst = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean<MessageDocument[]>()

    const hasOlderPage = newestFirst.length > limit
    const pageDocuments = hasOlderPage ? newestFirst.slice(0, limit) : newestFirst
    const items = pageDocuments.map(toMessageRecord).reverse()
    const nextCursor = hasOlderPage ? (items[0]?.id ?? null) : null

    return { outcome: 'page', page: { items, nextCursor } }
  }

  async findByClientMessageId(
    conversationId: string,
    clientMessageId: string,
  ): Promise<MessageRecord | null> {
    const document = await this.messageModel
      .findOne({ conversationId, clientMessageId })
      .lean<MessageDocument | null>()
    return document === null ? null : toMessageRecord(document)
  }

  async findAssistantReplyTo(
    conversationId: string,
    userMessageId: string,
  ): Promise<MessageRecord | null> {
    const document = await this.messageModel
      .findOne({ conversationId, 'metadata.replyToMessageId': userMessageId })
      .lean<MessageDocument | null>()
    return document === null ? null : toMessageRecord(document)
  }

  async insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord> {
    try {
      const created = await this.messageModel.create({
        _id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        body: message.body,
        createdAt: new Date(message.createdAt),
        clientMessageId,
        metadata: message.metadata ?? null,
      })
      return toMessageRecord(created.toObject())
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        // Concurrent retry of the same clientMessageId: the partial unique index
        // rejected the duplicate, so return the message that won the race.
        if (clientMessageId !== undefined) {
          const existing = await this.findByClientMessageId(message.conversationId, clientMessageId)
          if (existing !== null) {
            return existing
          }
        }
        // Concurrent assistant reply for the same user message: the unique reply index
        // rejected the duplicate, so return the reply that won the race.
        const userMessageId = message.metadata?.replyToMessageId
        if (userMessageId !== undefined) {
          const existingReply = await this.findAssistantReplyTo(
            message.conversationId,
            userMessageId,
          )
          if (existingReply !== null) {
            return existingReply
          }
        }
      }
      throw error
    }
  }
}
