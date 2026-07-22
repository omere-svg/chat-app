import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { PasswordResetOtpDocument } from './password-reset-otp.schema.js'
import { toPasswordResetOtpRecord } from './password-reset-otp.mapper.js'
import type { PasswordResetOtpRepository } from './password-reset-otp.repository.js'
import type { PasswordResetOtpRecord } from './types/password-reset-otp-record.js'

@Injectable()
export class MongoPasswordResetOtpRepository implements PasswordResetOtpRepository {
  constructor(
    @InjectModel(PasswordResetOtpDocument.name)
    private readonly otpModel: Model<PasswordResetOtpDocument>,
  ) {}

  async deleteByUserId(userId: string): Promise<void> {
    await this.otpModel.deleteMany({ userId })
  }

  async insert(record: PasswordResetOtpRecord): Promise<void> {
    await this.otpModel.create({
      _id: record.id,
      userId: record.userId,
      codeHash: record.codeHash,
      expiresAt: record.expiresAt,
      consumedAt: record.consumedAt,
      createdAt: new Date(),
    })
  }

  async findActiveByUserId(userId: string, now: Date): Promise<PasswordResetOtpRecord | null> {
    const document = await this.otpModel
      .findOne({ userId, consumedAt: null, expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .lean<PasswordResetOtpDocument | null>()
    return document === null ? null : toPasswordResetOtpRecord(document)
  }

  async consume(id: string, consumedAt: Date): Promise<boolean> {
    const result = await this.otpModel.updateOne(
      { _id: id, consumedAt: null },
      { $set: { consumedAt } },
    )
    return result.modifiedCount === 1
  }
}
