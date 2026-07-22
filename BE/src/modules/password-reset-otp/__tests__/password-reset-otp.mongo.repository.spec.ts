import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MongoPasswordResetOtpRepository } from '../password-reset-otp.mongo.repository.js'
import { PasswordResetOtpDocument, PasswordResetOtpSchema } from '../password-reset-otp.schema.js'
import type { Connection, Model } from 'mongoose'

describe('MongoPasswordResetOtpRepository', () => {
  let mongoServer: MongoMemoryServer
  let connection: Connection
  let otpModel: Model<PasswordResetOtpDocument>
  let repository: MongoPasswordResetOtpRepository

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    connection = await mongoose.createConnection(mongoServer.getUri()).asPromise()
    otpModel = connection.model(PasswordResetOtpDocument.name, PasswordResetOtpSchema)
    await otpModel.init()
    repository = new MongoPasswordResetOtpRepository(otpModel)
  })

  beforeEach(async () => {
    await otpModel.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
    await mongoServer.stop()
  })

  it('deletes any existing codes for the user', async () => {
    await insertOtp(repository, 'otp-1', 'user-1')
    await insertOtp(repository, 'otp-2', 'user-1')

    await repository.deleteByUserId('user-1')

    expect(await repository.findActiveByUserId('user-1', new Date())).toBeNull()
  })

  it('finds only an active (unconsumed, unexpired) code', async () => {
    await insertOtp(repository, 'otp-1', 'user-1')

    const active = await repository.findActiveByUserId('user-1', new Date())

    expect(active?.id).toBe('otp-1')
  })

  it('does not return an expired code', async () => {
    await insertOtp(repository, 'otp-1', 'user-1', {
      expiresAt: new Date(Date.now() - 60_000),
    })

    expect(await repository.findActiveByUserId('user-1', new Date())).toBeNull()
  })

  it('consumes a code once and rejects a second consume (single-use)', async () => {
    await insertOtp(repository, 'otp-1', 'user-1')

    const first = await repository.consume('otp-1', new Date())
    const second = await repository.consume('otp-1', new Date())

    expect(first).toBe(true)
    expect(second).toBe(false)
    expect(await repository.findActiveByUserId('user-1', new Date())).toBeNull()
  })
})

async function insertOtp(
  repository: MongoPasswordResetOtpRepository,
  id: string,
  userId: string,
  overrides?: { expiresAt?: Date },
): Promise<void> {
  await repository.insert({
    id,
    userId,
    codeHash: 'hash:123456',
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 60_000),
    consumedAt: null,
  })
}
