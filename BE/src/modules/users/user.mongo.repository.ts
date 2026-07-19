import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { UserDocument } from './user.schema.js'
import { toUserRecord } from './user.mapper.js'
import type { UserRepository } from './user.repository.js'
import type { UserRecord, UserUpdate } from './types/user.entity.js'

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
    const document = await this.userModel.findOne({ email: normalizedEmail }).lean<UserDocument | null>()
    return document === null ? null : toUserRecord(document)
  }

  async findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]> {
    const documents = await this.userModel
      .find({ email: { $in: [...normalizedEmails] } })
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
}
