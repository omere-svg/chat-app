import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { ConversationDocument } from './conversation.schema.js'
import {
  toConversationDocumentInput,
  toConversationRecord,
} from './conversation.mapper.js'
import type { ConversationRepository } from './conversation.repository.js'
import type { ConversationLastMessage, ConversationRecord } from './types/conversation.entity.js'

@Injectable()
export class MongoConversationRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationDocument.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async isEmpty(): Promise<boolean> {
    return (await this.conversationModel.countDocuments({})) === 0
  }

  async findById(conversationId: string): Promise<ConversationRecord | null> {
    const document = await this.conversationModel
      .findById(conversationId)
      .lean<ConversationDocument | null>()
    return document === null ? null : toConversationRecord(document)
  }

  async findByParticipantSortedByActivity(userId: string): Promise<ConversationRecord[]> {
    const documents = await this.conversationModel
      .find({ participantIds: userId })
      .sort({ lastActivityAt: -1, _id: -1 })
      .lean<ConversationDocument[]>()
    return documents.map(toConversationRecord)
  }

  async findByExactParticipants(
    participantIds: readonly string[],
  ): Promise<ConversationRecord | null> {
    const document = await this.conversationModel
      .findOne({ participantIds: { $all: [...participantIds], $size: participantIds.length } })
      .lean<ConversationDocument | null>()
    return document === null ? null : toConversationRecord(document)
  }

  async insert(conversation: ConversationRecord): Promise<ConversationRecord> {
    const created = await this.conversationModel.create(toConversationDocumentInput(conversation))
    return toConversationRecord(created.toObject())
  }

  async advanceLastMessageIfNewer(
    conversationId: string,
    lastMessage: ConversationLastMessage,
  ): Promise<void> {
    const lastActivityAt = new Date(lastMessage.createdAt)
    await this.conversationModel.updateOne(
      {
        _id: conversationId,
        lastActivityAt: { $lt: lastActivityAt },
      },
      {
        $set: {
          lastActivityAt,
          lastMessage: {
            body: lastMessage.body,
            senderId: lastMessage.senderId,
            createdAt: lastActivityAt,
          },
        },
      },
    )
  }

  async setTitleIfCurrentTitleMatches(
    conversationId: string,
    title: string,
    expectedCurrentTitle: string,
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: conversationId, title: expectedCurrentTitle },
      { $set: { title } },
    )
  }
}
