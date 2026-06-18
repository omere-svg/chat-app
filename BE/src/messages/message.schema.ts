import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

@Schema({ collection: 'messages', versionKey: false })
export class MessageDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  conversationId!: string

  @Prop({ type: String, required: true })
  senderId!: string

  @Prop({ type: String, required: true })
  body!: string

  @Prop({ type: Date, required: true })
  createdAt!: Date

  // Optional client-supplied idempotency key. The partial unique index below
  // makes a retried send collapse onto the original message at the DB level.
  @Prop({ type: String })
  clientMessageId?: string
}

export type MessageHydratedDocument = HydratedDocument<MessageDocument>

export const MessageSchema = SchemaFactory.createForClass(MessageDocument)

// Backs message-history pagination and the (createdAt, _id) cursor walk.
MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 })

// Enforces send idempotency per conversation when a clientMessageId is present.
MessageSchema.index(
  { conversationId: 1, clientMessageId: 1 },
  { unique: true, partialFilterExpression: { clientMessageId: { $exists: true } } },
)
