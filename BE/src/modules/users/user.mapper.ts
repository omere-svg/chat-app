import type { UserDocument } from './user.schema.js'
import type { UserRecord } from './types/user.entity.js'
import type { PublicUser } from './types/user-public-view.js'

export function toUserRecord(document: UserDocument): UserRecord {
  return {
    id: document._id,
    email: document.email,
    passwordHash: document.passwordHash,
    firstName: document.firstName,
    lastName: document.lastName,
  }
}

export function toPublicUser(userRecord: UserRecord): PublicUser {
  return {
    id: userRecord.id,
    email: userRecord.email,
    firstName: userRecord.firstName,
    lastName: userRecord.lastName,
  }
}

export function formatFullName(user: Pick<PublicUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}
