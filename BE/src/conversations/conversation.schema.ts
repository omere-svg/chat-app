import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

import type { MessageDocument } from '../messages/message.schema.js'

@Schema({ _id: false, versionKey: false })
export class ConversationLastMessageDocument
  implements Pick<MessageDocument, 'body' | 'senderId' | 'createdAt'>
{
  @Prop({ type: String, required: true })
  body!: string

  @Prop({ type: String, required: true })
  senderId!: string

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

const ConversationLastMessageSchema = SchemaFactory.createForClass(ConversationLastMessageDocument)

@Schema({ collection: 'conversations', versionKey: false })
export class ConversationDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  title!: string

  @Prop({ type: [String], required: true })
  participantIds!: string[]

  // Denormalized sort key + preview snapshot of the newest message, advanced on
  // each send. Lets the conversation list resolve in one indexed query with no
  // per-conversation message reads.
  @Prop({ type: Date, required: true })
  lastActivityAt!: Date

  @Prop({ type: ConversationLastMessageSchema, default: null })
  lastMessage!: ConversationLastMessageDocument | null

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export type ConversationHydratedDocument = HydratedDocument<ConversationDocument>

export const ConversationSchema = SchemaFactory.createForClass(ConversationDocument)

// Backs "list my conversations sorted by last activity".
ConversationSchema.index({ participantIds: 1, lastActivityAt: -1 })
