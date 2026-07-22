import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import {
  USER_COLLECTION_NAME,
  USER_EMAIL_COLLATION,
  USER_EMAIL_INDEX_NAME,
} from './constants.js'
import type { StoredAvatar } from './types/stored-avatar.js'

@Schema({ collection: USER_COLLECTION_NAME, versionKey: false })
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

  @Prop({ type: [String], required: true, default: [] })
  previousEmails!: string[]

  @Prop({ type: Date, required: false, default: null })
  sessionsInvalidatedAt!: Date | null

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export type UserHydratedDocument = HydratedDocument<UserDocument>

export const UserSchema = SchemaFactory.createForClass(UserDocument)

UserSchema.index(
  { email: 1 },
  { name: USER_EMAIL_INDEX_NAME, unique: true, collation: USER_EMAIL_COLLATION },
)
