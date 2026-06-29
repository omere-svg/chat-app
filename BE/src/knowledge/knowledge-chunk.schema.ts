import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

@Schema({ collection: 'knowledge_chunks', versionKey: false })
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

// Backs delete-a-document's-chunks and ingestion's orphan-chunk cleanup on a failed
// or losing write. The embedding field is served by a separate Atlas Vector Search
// index (see atlas/ vector-index config), not by a Mongoose index.
KnowledgeChunkSchema.index({ userId: 1, documentId: 1 })
