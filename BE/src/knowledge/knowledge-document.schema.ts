import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import type { IngestionStatus } from './knowledge-document.entity.js'

@Schema({ collection: 'knowledge_documents', versionKey: false })
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

export type KnowledgeDocumentHydratedDocument = HydratedDocument<KnowledgeDocumentDocument>

export const KnowledgeDocumentSchema = SchemaFactory.createForClass(KnowledgeDocumentDocument)

// Dedup identity: one document per (owner, content). Enforced at the DB layer so a
// concurrent re-upload of identical bytes can't race past the application check.
// userId + contentHash are always set, so a plain compound unique index suffices.
KnowledgeDocumentSchema.index({ userId: 1, contentHash: 1 }, { unique: true })

// Backs "list my documents, newest first" for the knowledge-base panel.
KnowledgeDocumentSchema.index({ userId: 1, createdAt: -1 })
