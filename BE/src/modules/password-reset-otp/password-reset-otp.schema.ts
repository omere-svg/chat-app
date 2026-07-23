import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
  PASSWORD_RESET_OTP_COLLECTION_NAME,
  PASSWORD_RESET_OTP_EXPIRY_INDEX_NAME,
  PASSWORD_RESET_OTP_USER_INDEX_NAME,
} from './constants.js'

@Schema({ collection: PASSWORD_RESET_OTP_COLLECTION_NAME, versionKey: false })
export class PasswordResetOtpDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  userId!: string

  @Prop({ type: String, required: true })
  codeHash!: string

  @Prop({ type: Date, required: true })
  expiresAt!: Date

  @Prop({ type: Date, required: false, default: null })
  consumedAt!: Date | null

  @Prop({ type: Date, required: true })
  createdAt!: Date
}

export const PasswordResetOtpSchema = SchemaFactory.createForClass(PasswordResetOtpDocument)

PasswordResetOtpSchema.index({ userId: 1 }, { name: PASSWORD_RESET_OTP_USER_INDEX_NAME })

PasswordResetOtpSchema.index(
  { expiresAt: 1 },
  { name: PASSWORD_RESET_OTP_EXPIRY_INDEX_NAME, expireAfterSeconds: 0 },
)
