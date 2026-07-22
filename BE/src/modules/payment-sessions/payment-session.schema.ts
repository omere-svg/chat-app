import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import {
  PAYMENT_SESSION_PROVIDER_INDEX_NAME,
  PAYMENT_SESSIONS_COLLECTION_NAME,
} from './constants.js'
import type { PaymentSessionStatus } from './types/payment-session.js'

@Schema({ collection: PAYMENT_SESSIONS_COLLECTION_NAME, versionKey: false })
export class PaymentSessionDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  userId!: string

  @Prop({ type: String, required: true })
  planCode!: string

  @Prop({ type: String, required: true })
  providerSessionId!: string

  @Prop({ type: String, required: true })
  status!: PaymentSessionStatus

  @Prop({ type: [String], required: true, default: [] })
  processedEventIds!: string[]

  @Prop({ type: Date, required: true })
  createdAt!: Date

  @Prop({ type: Date, required: true })
  updatedAt!: Date
}

export type PaymentSessionHydratedDocument = HydratedDocument<PaymentSessionDocument>

export const PaymentSessionSchema = SchemaFactory.createForClass(PaymentSessionDocument)

PaymentSessionSchema.index(
  { providerSessionId: 1 },
  { name: PAYMENT_SESSION_PROVIDER_INDEX_NAME, unique: true },
)
