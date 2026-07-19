import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import type { StoredAvatar } from './types/stored-avatar.js'

@Schema({ collection: 'users', versionKey: false })
export class UserDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  email!: string

  @Prop({ type: String, required: true })
  passwordHash!: string

  @Prop({ type: String, required: true })
  firstName!: string

  @Prop({ type: String, required: true })
  lastName!: string

  @Prop({
    type: raw({
      srcUrl: { type: String, required: false, default: null },
      key: { type: String, required: true },
    }),
    required: false,
    default: null,
  })
  avatar!: StoredAvatar | null

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export type UserHydratedDocument = HydratedDocument<UserDocument>

export const UserSchema = SchemaFactory.createForClass(UserDocument)

UserSchema.index({ email: 1 }, { unique: true })
