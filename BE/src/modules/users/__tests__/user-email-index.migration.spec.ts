import { MongoMemoryServer } from 'mongodb-memory-server'
import { mongo } from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  LEGACY_USER_EMAIL_INDEX_NAME,
  USER_COLLECTION_NAME,
  USER_EMAIL_COLLATION,
  USER_EMAIL_INDEX_NAME,
} from '../constants.js'
import { migrateUserEmailIndex } from '../user-email-index.mongo.repository.js'

describe('migrateUserEmailIndex', () => {
  let mongoServer: MongoMemoryServer
  let client: mongo.MongoClient
  let database: mongo.Db
  let collection: mongo.Collection

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    client = new mongo.MongoClient(mongoServer.getUri())
    await client.connect()
    database = client.db('user-email-index-migration')
    collection = database.collection(USER_COLLECTION_NAME)
  })

  beforeEach(async () => {
    await database.dropDatabase()
    await collection.createIndex(
      { email: 1 },
      { name: LEGACY_USER_EMAIL_INDEX_NAME, unique: true },
    )
  })

  afterAll(async () => {
    await client.close()
    await mongoServer.stop()
  })

  it('creates and verifies the named case-insensitive unique index before removing email_1', async () => {
    await collection.insertOne({ _id: new mongo.ObjectId(), email: 'Alice@example.com' })

    await migrateUserEmailIndex(collection)

    const indexes = await collection.indexes()
    const migratedIndex = indexes.find((index) => index.name === USER_EMAIL_INDEX_NAME)
    expect(migratedIndex).toMatchObject({
      key: { email: 1 },
      unique: true,
      collation: USER_EMAIL_COLLATION,
    })
    expect(indexes.map((index) => index.name)).not.toContain(LEGACY_USER_EMAIL_INDEX_NAME)
    await expect(
      collection.insertOne({ _id: new mongo.ObjectId(), email: 'alice@example.com' }),
    ).rejects.toMatchObject({ code: 11000 })
  })

  it('reports case-insensitive collisions and preserves the legacy index', async () => {
    await collection.insertMany([
      { _id: new mongo.ObjectId(), email: 'Alice@example.com' },
      { _id: new mongo.ObjectId(), email: 'alice@example.com' },
    ])

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(
      /collision.*Alice@example\.com.*alice@example\.com/i,
    )

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
    expect(indexNames).not.toContain(USER_EMAIL_INDEX_NAME)
  })

  it('is idempotent after the named index replaces the legacy index', async () => {
    await collection.insertOne({ _id: new mongo.ObjectId(), email: 'alice@example.com' })

    await migrateUserEmailIndex(collection)
    await migrateUserEmailIndex(collection)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toEqual(['_id_', USER_EMAIL_INDEX_NAME])
  })

  it('preserves the legacy index when an existing named index cannot be verified', async () => {
    await collection.createIndex(
      { email: 1, _id: 1 },
      { name: USER_EMAIL_INDEX_NAME, unique: true, collation: USER_EMAIL_COLLATION },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })

  it('rejects a case-sensitive named collation and preserves the legacy index', async () => {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        collation: { ...USER_EMAIL_COLLATION, caseLevel: true },
      },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })

  it('rejects a shifted-alternate named collation and preserves the legacy index', async () => {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        collation: { ...USER_EMAIL_COLLATION, alternate: 'shifted' },
      },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })

  it('rejects a numeric-ordering named collation and preserves the legacy index', async () => {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        collation: { ...USER_EMAIL_COLLATION, numericOrdering: true },
      },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })

  it('rejects a sparse named index and preserves the legacy index', async () => {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        sparse: true,
        collation: USER_EMAIL_COLLATION,
      },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })

  it('rejects a partial named index and preserves the legacy index', async () => {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
        collation: USER_EMAIL_COLLATION,
      },
    )

    await expect(migrateUserEmailIndex(collection)).rejects.toThrow(/invalid/i)

    const indexNames = (await collection.indexes()).map((index) => index.name)
    expect(indexNames).toContain(LEGACY_USER_EMAIL_INDEX_NAME)
  })
})
