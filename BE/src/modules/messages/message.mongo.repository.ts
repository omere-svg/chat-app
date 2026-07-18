import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model, QueryFilter } from 'mongoose'
import { MessageDocument } from './message.schema.js'
import { toMessageRecord } from './message.mapper.js'
import { isDuplicateKeyError } from '../../shared/database/mongo-errors.js'
import type { CursorPageResult } from '../../shared/pagination/cursor-page.js'
import type { MessageRepository } from './message.repository.js'
import type { MessageRecord } from './types/message.entity.js'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
      filter.$or = [
        { createdAt: { $lt: cursorMessage.createdAt } },
        { createdAt: cursorMessage.createdAt, _id: { $lt: cursorMessage._id } },
      ]
    }

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

  async searchAuthoredByUser(
    userId: string,
    query: string,
    limit: number,
  ): Promise<MessageRecord[]> {
    const documents = await this.messageModel
      .find({ senderId: userId, body: { $regex: escapeRegExp(query), $options: 'i' } })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean<MessageDocument[]>()
    return documents.map(toMessageRecord)
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
        if (clientMessageId !== undefined) {
          const existing = await this.findByClientMessageId(message.conversationId, clientMessageId)
          if (existing !== null) {
            return existing
          }
        }
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
