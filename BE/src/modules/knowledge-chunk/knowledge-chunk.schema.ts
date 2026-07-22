import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import { KNOWLEDGE_CHUNKS_COLLECTION } from './constants.js'

@Schema({ collection: KNOWLEDGE_CHUNKS_COLLECTION, versionKey: false })
export class KnowledgeChunkDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  userId!: string

  @Prop({ type: String, required: true })
  documentId!: string

  @Prop({ type: String, required: true })
  documentName!: string

  @Prop({ type: Number, required: true })
  chunkIndex!: number

  @Prop({ type: String, required: true })
  text!: string

  @Prop({ type: [Number], required: true })
  embedding!: number[]
}

export type KnowledgeChunkHydratedDocument = HydratedDocument<KnowledgeChunkDocument>

export const KnowledgeChunkSchema = SchemaFactory.createForClass(KnowledgeChunkDocument)

KnowledgeChunkSchema.index({ userId: 1, documentId: 1 })
