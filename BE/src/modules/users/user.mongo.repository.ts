import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { UserDocument } from './user.schema.js'
import { toUserRecord } from './user.mapper.js'
import { MAX_PREVIOUS_EMAILS, USER_EMAIL_COLLATION } from './constants.js'
import { isDuplicateKeyError } from '../../shared/database/mongo-errors.js'
import type { UserRepository } from './user.repository.js'
import type { ConfirmedEmailChange, UserRecord, UserUpdate } from './types/user.entity.js'
import type { ConfirmedEmailChangeResult } from './types/confirmed-email-change-result.js'

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async isEmpty(): Promise<boolean> {
    return (await this.userModel.countDocuments({})) === 0
  }

  async findById(userId: string): Promise<UserRecord | null> {
    const document = await this.userModel.findById(userId).lean<UserDocument | null>()
    return document === null ? null : toUserRecord(document)
  }

  async findByEmail(normalizedEmail: string): Promise<UserRecord | null> {
    const document = await this.userModel
      .findOne({ email: normalizedEmail })
      .collation(USER_EMAIL_COLLATION)
      .lean<UserDocument | null>()
    return document === null ? null : toUserRecord(document)
  }

  async findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]> {
    const documents = await this.userModel
      .find({ email: { $in: [...normalizedEmails] } })
      .collation(USER_EMAIL_COLLATION)
      .lean<UserDocument[]>()
    return documents.map(toUserRecord)
  }

  async findByIds(userIds: readonly string[]): Promise<UserRecord[]> {
    const documents = await this.userModel
      .find({ _id: { $in: [...userIds] } })
      .lean<UserDocument[]>()
    return documents.map(toUserRecord)
  }

  async insert(userRecord: UserRecord): Promise<UserRecord> {
    const created = await this.userModel.create({
      _id: userRecord.id,
      email: userRecord.email,
      passwordHash: userRecord.passwordHash,
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      avatar: userRecord.avatar,
      previousEmails: userRecord.previousEmails,
      createdAt: new Date(),
    })
    return toUserRecord(created.toObject())
  }

  async update(userId: string, patch: UserUpdate): Promise<UserRecord | null> {
    const document = await this.userModel
      .findByIdAndUpdate(userId, { $set: patch }, { returnDocument: 'after' })
      .lean<UserDocument | null>()
    return document === null ? null : toUserRecord(document)
  }

  async applyConfirmedEmailChange({
    userId,
    newEmail,
  }: ConfirmedEmailChange): Promise<ConfirmedEmailChangeResult> {
    try {
      const document = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          [
            {
              $set: {
                previousEmails: {
                  $cond: [
                    { $eq: ['$email', newEmail] },
                    { $ifNull: ['$previousEmails', []] },
                    {
                      $slice: [
                        {
                          $concatArrays: [{ $ifNull: ['$previousEmails', []] }, ['$email']],
                        },
                        -MAX_PREVIOUS_EMAILS,
                      ],
                    },
                  ],
                },
                email: newEmail,
              },
            },
          ],
          {
            returnDocument: 'after',
            updatePipeline: true,
            collation: USER_EMAIL_COLLATION,
          },
        )
        .lean<UserDocument | null>()
      return document === null
        ? { outcome: 'not-found' }
        : { outcome: 'user', user: toUserRecord(document) }
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return { outcome: 'email-taken' }
      }
      throw error
    }
  }
}
