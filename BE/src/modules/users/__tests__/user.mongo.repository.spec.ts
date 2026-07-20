import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MAX_PREVIOUS_EMAILS } from '../constants.js'
import { MongoUserRepository } from '../user.mongo.repository.js'
import { UserDocument, UserSchema } from '../user.schema.js'
import type { Connection, Model } from 'mongoose'

describe('MongoUserRepository', () => {
  let mongoServer: MongoMemoryServer
  let connection: Connection
  let userModel: Model<UserDocument>
  let repository: MongoUserRepository

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    connection = await mongoose.createConnection(mongoServer.getUri()).asPromise()
    userModel = connection.model(UserDocument.name, UserSchema)
    await userModel.init()
    repository = new MongoUserRepository(userModel)
  })

  beforeEach(async () => {
    await userModel.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
    await mongoServer.stop()
  })

  it('finds one email with the shared case-insensitive collation', async () => {
    await insertUser(repository, 'user-1', 'Alice@Example.com')

    const result = await repository.findByEmail('alice@example.com')

    expect(result?.id).toBe('user-1')
  })

  it('finds multiple emails with the shared case-insensitive collation', async () => {
    await insertUser(repository, 'user-1', 'Alice@Example.com')
    await insertUser(repository, 'user-2', 'Bob@Example.com')

    const result = await repository.findByEmails(['alice@example.com', 'BOB@example.com'])

    expect(result.map((user) => user.id).sort()).toEqual(['user-1', 'user-2'])
  })

  it('returns email-taken when a case variant belongs to another user', async () => {
    await insertUser(repository, 'user-1', 'first@example.com')
    await insertUser(repository, 'user-2', 'Owner@Example.com')

    const result = await repository.applyConfirmedEmailChange({
      userId: 'user-1',
      newEmail: 'owner@example.com',
    })

    expect(result).toEqual({ outcome: 'email-taken' })
  })

  it('keeps the most recent ten raw previous emails over eleven sequential changes', async () => {
    await insertUser(repository, 'user-1', 'old@example.com')

    for (let index = 1; index <= 11; index++) {
      await repository.applyConfirmedEmailChange({
        userId: 'user-1',
        newEmail: `email-${index.toString()}@example.com`,
      })
    }

    const stored = await repository.findById('user-1')
    expect(stored?.previousEmails).toHaveLength(MAX_PREVIOUS_EMAILS)
    expect(stored?.previousEmails).toEqual([
      'email-1@example.com',
      'email-2@example.com',
      'email-3@example.com',
      'email-4@example.com',
      'email-5@example.com',
      'email-6@example.com',
      'email-7@example.com',
      'email-8@example.com',
      'email-9@example.com',
      'email-10@example.com',
    ])
  })

  it('returns the authoritative user without appending history on replay', async () => {
    await insertUser(repository, 'user-1', 'old@example.com')
    await repository.applyConfirmedEmailChange({
      userId: 'user-1',
      newEmail: 'new@example.com',
    })

    const replay = await repository.applyConfirmedEmailChange({
      userId: 'user-1',
      newEmail: 'new@example.com',
    })

    expect(replay).toMatchObject({ outcome: 'user', user: { email: 'new@example.com' } })
    expect((await repository.findById('user-1'))?.previousEmails).toEqual(['old@example.com'])
  })

  it('returns the authoritative user to both concurrent same-target confirmations', async () => {
    await insertUser(repository, 'user-1', 'old@example.com')

    const [first, second] = await Promise.all([
      repository.applyConfirmedEmailChange({
        userId: 'user-1',
        newEmail: 'new@example.com',
      }),
      repository.applyConfirmedEmailChange({
        userId: 'user-1',
        newEmail: 'new@example.com',
      }),
    ])

    expect(first).toMatchObject({ outcome: 'user', user: { email: 'new@example.com' } })
    expect(second).toMatchObject({ outcome: 'user', user: { email: 'new@example.com' } })
    expect((await repository.findById('user-1'))?.previousEmails).toEqual(['old@example.com'])
  })

  it('returns not-found only when the user is absent', async () => {
    const result = await repository.applyConfirmedEmailChange({
      userId: 'missing-user',
      newEmail: 'new@example.com',
    })

    expect(result).toEqual({ outcome: 'not-found' })
  })
})

async function insertUser(
  repository: MongoUserRepository,
  id: string,
  email: string,
): Promise<void> {
  await repository.insert({
    id,
    email,
    passwordHash: 'password-hash',
    firstName: 'First',
    lastName: 'Last',
    avatar: null,
    previousEmails: [],
  })
}
