import type { UserDocument } from './user.schema.js'
import type { UserRecord } from './user.entity.js'

export function toUserRecord(document: UserDocument): UserRecord {
  return {
    id: document._id,
    email: document.email,
    passwordHash: document.passwordHash,
    firstName: document.firstName,
    lastName: document.lastName,
  }
}
