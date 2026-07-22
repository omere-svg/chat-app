import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import { PLAN_ACTIVE_INDEX_NAME, PLANS_COLLECTION_NAME } from './constants.js'

@Schema({ collection: PLANS_COLLECTION_NAME, versionKey: false })
export class PlanDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  name!: string

  @Prop({ type: Number, required: true })
  amount!: number

  @Prop({ type: String, required: true })
  currency!: string

  @Prop({ type: String, required: true })
  interval!: string

  @Prop({ type: Boolean, required: true, default: true })
  active!: boolean
}

export type PlanHydratedDocument = HydratedDocument<PlanDocument>

export const PlanSchema = SchemaFactory.createForClass(PlanDocument)

PlanSchema.index({ active: 1 }, { name: PLAN_ACTIVE_INDEX_NAME })
