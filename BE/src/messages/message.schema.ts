import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

@Schema({ _id: false, versionKey: false })
export class MessageMetadataDocument {
  @Prop({ type: String })
  replyToMessageId?: string
}

const MessageMetadataSchema = SchemaFactory.createForClass(MessageMetadataDocument)

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

  // Non-human message provenance (assistant replies). Null for ordinary messages.
  @Prop({ type: MessageMetadataSchema, default: null })
  metadata!: MessageMetadataDocument | null
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

// Backs the idempotent-replay lookup: find the assistant reply generated for a
// given user message. Unique so concurrent retries can't persist two replies for the
// same user message; partial so it only indexes assistant replies that set it.
MessageSchema.index(
  { conversationId: 1, 'metadata.replyToMessageId': 1 },
  { unique: true, partialFilterExpression: { 'metadata.replyToMessageId': { $exists: true } } },
)
