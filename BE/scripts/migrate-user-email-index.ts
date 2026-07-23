import mongoose from 'mongoose'
import { USER_COLLECTION_NAME, USER_EMAIL_INDEX_NAME } from '../src/modules/users/constants.js'
import { migrateUserEmailIndex } from '../src/modules/users/user-email-index.migration.js'

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI
  if (uri === undefined || uri.length === 0) {
    throw new Error('MONGO_URI is required')
  }

  await mongoose.connect(uri)
  try {
    const database = mongoose.connection.db
    if (database === undefined) {
      throw new Error('Database connection is not established')
    }
    await migrateUserEmailIndex(database.collection(USER_COLLECTION_NAME))
    console.log(`Email index "${USER_EMAIL_INDEX_NAME}" is ready.`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('Failed to migrate the user email index:', error)
  process.exitCode = 1
})
