import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

import { DEFAULT_CONVERSATION_TYPE } from './conversation.entity.js'
import type { ConversationType } from './conversation.entity.js'
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

  // Defaulted so conversations seeded or created before this field existed read
  // back as 'direct' rather than undefined.
  @Prop({ type: String, required: true, default: DEFAULT_CONVERSATION_TYPE })
  type!: ConversationType

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
