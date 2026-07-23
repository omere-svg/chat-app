import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { KNOWLEDGE_DOCUMENTS_COLLECTION } from './constants.js'
import type { IngestionStatus } from './types/knowledge-document.entity.js'

@Schema({ collection: KNOWLEDGE_DOCUMENTS_COLLECTION, versionKey: false })
export class KnowledgeDocumentDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  userId!: string

  @Prop({ type: String, required: true })
  filename!: string

  @Prop({ type: String, required: true })
  contentHash!: string

  @Prop({ type: Number, required: true })
  byteSize!: number

  @Prop({ type: Number, required: true })
  chunkCount!: number

  @Prop({ type: String, required: true })
  status!: IngestionStatus

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export const KnowledgeDocumentSchema = SchemaFactory.createForClass(KnowledgeDocumentDocument)

KnowledgeDocumentSchema.index({ userId: 1, contentHash: 1 }, { unique: true })

KnowledgeDocumentSchema.index({ userId: 1, createdAt: -1 })
