import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { KnowledgeDocumentDocument } from '../knowledge-document.schema.js'
import { toKnowledgeDocumentRecord } from '../knowledge-document.mapper.js'
import type { KnowledgeDocumentRepository } from './knowledge-document-repository.port.js'
import type { KnowledgeDocumentRecord } from '../knowledge-document.entity.js'

@Injectable()
export class MongoKnowledgeDocumentRepository implements KnowledgeDocumentRepository {
  constructor(
    @InjectModel(KnowledgeDocumentDocument.name)
    private readonly documentModel: Model<KnowledgeDocumentDocument>,
  ) {}

  async findByContentHashForUser(
    userId: string,
    contentHash: string,
  ): Promise<KnowledgeDocumentRecord | null> {
    const document = await this.documentModel
      .findOne({ userId, contentHash })
      .lean<KnowledgeDocumentDocument | null>()
    return document === null ? null : toKnowledgeDocumentRecord(document)
  }

  async findByIdForUser(
    userId: string,
    documentId: string,
  ): Promise<KnowledgeDocumentRecord | null> {
    const document = await this.documentModel
      .findOne({ _id: documentId, userId })
      .lean<KnowledgeDocumentDocument | null>()
    return document === null ? null : toKnowledgeDocumentRecord(document)
  }

  async listByUserNewestFirst(userId: string): Promise<KnowledgeDocumentRecord[]> {
    const documents = await this.documentModel
      .find({ userId })
      .sort({ createdAt: -1, _id: -1 })
      .lean<KnowledgeDocumentDocument[]>()
    return documents.map(toKnowledgeDocumentRecord)
  }

  async insert(document: KnowledgeDocumentRecord): Promise<KnowledgeDocumentRecord> {
    const created = await this.documentModel.create({
      _id: document.id,
      userId: document.userId,
      filename: document.filename,
      contentHash: document.contentHash,
      byteSize: document.byteSize,
      chunkCount: document.chunkCount,
      status: document.status,
      createdAt: new Date(document.createdAt),
    })
    return toKnowledgeDocumentRecord(created.toObject())
  }

  async deleteByIdForUser(userId: string, documentId: string): Promise<boolean> {
    const result = await this.documentModel.deleteOne({ _id: documentId, userId })
    return result.deletedCount > 0
  }
}
