import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import { SUBSCRIPTIONS_COLLECTION_NAME } from './constants.js'
import type { SubscriptionStatus } from './types/subscription.js'

@Schema({ collection: SUBSCRIPTIONS_COLLECTION_NAME, versionKey: false })
export class SubscriptionDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: false, default: null })
  planCode!: string | null

  @Prop({ type: String, required: true })
  status!: SubscriptionStatus

  @Prop({ type: Date, required: false, default: null })
  activatedAt!: Date | null
}

export type SubscriptionHydratedDocument = HydratedDocument<SubscriptionDocument>

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionDocument)
