import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { ConversationDocument } from '../conversation.schema.js'
import type { ConversationRepository } from './conversation-repository.port.js'
import type { ConversationLastMessage, ConversationRecord } from '../conversation.entity.js'

function toConversationRecord(document: ConversationDocument): ConversationRecord {
  return {
    id: document._id,
    title: document.title,
    participantIds: [...document.participantIds],
    lastMessageAt: (document.lastMessageAt ?? document.createdAt).toISOString(),
    lastMessage:
      document.lastMessage === null
        ? null
        : {
            body: document.lastMessage.body,
            senderId: document.lastMessage.senderId,
            createdAt: document.lastMessage.createdAt.toISOString(),
          },
    createdAt: document.createdAt.toISOString(),
  }
}

function toConversationDocumentInput(conversation: ConversationRecord): ConversationDocument {
  return {
    _id: conversation.id,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastMessageAt: new Date(conversation.lastMessageAt),
    lastMessage:
      conversation.lastMessage === null
        ? null
        : {
            body: conversation.lastMessage.body,
            senderId: conversation.lastMessage.senderId,
            createdAt: new Date(conversation.lastMessage.createdAt),
          },
    createdAt: new Date(conversation.createdAt),
  }
}

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

  async findByParticipant(userId: string): Promise<ConversationRecord[]> {
    const documents = await this.conversationModel
      .find({ participantIds: userId })
      .sort({ lastMessageAt: -1, _id: -1 })
      .lean<ConversationDocument[]>()
    return documents.map(toConversationRecord)
  }

  async findByParticipantSet(
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

  async advanceLastMessage(
    conversationId: string,
    lastMessage: ConversationLastMessage,
  ): Promise<void> {
    const lastMessageAt = new Date(lastMessage.createdAt)
    await this.conversationModel.updateOne(
      {
        _id: conversationId,
        $or: [{ lastMessageAt: null }, { lastMessageAt: { $lt: lastMessageAt } }],
      },
      {
        $set: {
          lastMessageAt,
          lastMessage: {
            body: lastMessage.body,
            senderId: lastMessage.senderId,
            createdAt: lastMessageAt,
          },
        },
      },
    )
  }
}
