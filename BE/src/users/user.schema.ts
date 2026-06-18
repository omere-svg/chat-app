import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

@Schema({ collection: 'users', versionKey: false })
export class UserDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  email!: string

  @Prop({ type: String, required: true })
  passwordHash!: string

  @Prop({ type: String, required: true })
  displayName!: string

  @Prop({ type: String })
  avatarUrl?: string

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export type UserHydratedDocument = HydratedDocument<UserDocument>

export const UserSchema = SchemaFactory.createForClass(UserDocument)

// Backs login / signup uniqueness and email lookups.
UserSchema.index({ email: 1 }, { unique: true })
