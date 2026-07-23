import type { mongo } from 'mongoose'
import {
  LEGACY_USER_EMAIL_INDEX_NAME,
  USER_EMAIL_COLLATION,
  USER_EMAIL_INDEX_NAME,
} from './constants.js'

export async function migrateUserEmailIndex(collection: mongo.Collection): Promise<void> {
  const collisions = await collection
    .aggregate(
      [
        { $match: { email: { $type: 'string' } } },
        {
          $group: {
            _id: '$email',
            emails: { $push: '$email' },
            userIds: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ],
      { collation: USER_EMAIL_COLLATION },
    )
    .toArray()

  if (collisions.length > 0) {
    throw new Error(
      `Case-insensitive email collision detected. Resolve these users before migrating: ${JSON.stringify(collisions)}`,
    )
  }

  const existingNamedIndex = (await collection.indexes()).find(
    (index) => index.name === USER_EMAIL_INDEX_NAME,
  )
  if (existingNamedIndex !== undefined) {
    assertValidUserEmailIndex(existingNamedIndex)
  } else {
    await collection.createIndex(
      { email: 1 },
      {
        name: USER_EMAIL_INDEX_NAME,
        unique: true,
        collation: USER_EMAIL_COLLATION,
      },
    )
  }

  const verifiedIndex = (await collection.indexes()).find(
    (index) => index.name === USER_EMAIL_INDEX_NAME,
  )
  if (verifiedIndex === undefined) {
    throw new Error(`User email index "${USER_EMAIL_INDEX_NAME}" was not created`)
  }
  assertValidUserEmailIndex(verifiedIndex)

  const legacyIndexExists = (await collection.indexes()).some(
    (index) => index.name === LEGACY_USER_EMAIL_INDEX_NAME,
  )
  if (legacyIndexExists) {
    await collection.dropIndex(LEGACY_USER_EMAIL_INDEX_NAME)
  }
}

function assertValidUserEmailIndex(index: mongo.IndexDescriptionInfo): void {
  const hasOnlyEmailKey = Object.keys(index.key).length === 1 && index.key.email === 1
  const hasExpectedCollation =
    index.collation?.locale === USER_EMAIL_COLLATION.locale &&
    index.collation.caseLevel === USER_EMAIL_COLLATION.caseLevel &&
    index.collation.caseFirst === USER_EMAIL_COLLATION.caseFirst &&
    index.collation.strength === USER_EMAIL_COLLATION.strength &&
    index.collation.numericOrdering === USER_EMAIL_COLLATION.numericOrdering &&
    index.collation.alternate === USER_EMAIL_COLLATION.alternate &&
    index.collation.maxVariable === USER_EMAIL_COLLATION.maxVariable &&
    index.collation.backwards === USER_EMAIL_COLLATION.backwards &&
    index.collation.normalization === USER_EMAIL_COLLATION.normalization
  const coversEntireCollection =
    index.sparse !== true && index.partialFilterExpression === undefined

  if (
    !hasOnlyEmailKey ||
    index.unique !== true ||
    !hasExpectedCollation ||
    !coversEntireCollection
  ) {
    throw new Error(`User email index "${USER_EMAIL_INDEX_NAME}" is invalid`)
  }
}
