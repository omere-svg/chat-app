import type { UserDocument } from './user.schema.js'
import type { UserRecord } from './user.entity.js'

export function toUserRecord(document: UserDocument): UserRecord {
  const userRecord: UserRecord = {
    id: document._id,
    email: document.email,
    passwordHash: document.passwordHash,
    displayName: document.displayName,
  }

  if (document.avatarUrl !== undefined) {
    userRecord.avatarUrl = document.avatarUrl
  }

  return userRecord
}
