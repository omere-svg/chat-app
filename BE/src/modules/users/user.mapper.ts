import type { UserDocument } from './user.schema.js'
import type { UserRecord } from './types/user.entity.js'
import type { User } from './types/user.js'

export function toUserRecord(document: UserDocument): UserRecord {
  return {
    id: document._id,
    email: document.email,
    passwordHash: document.passwordHash,
    firstName: document.firstName,
    lastName: document.lastName,
    avatar: document.avatar ?? null,
    previousEmails: document.previousEmails ?? [],
  }
}

export function toUser(userRecord: UserRecord): User {
  return {
    id: userRecord.id,
    email: userRecord.email,
    firstName: userRecord.firstName,
    lastName: userRecord.lastName,
    avatarUrl: userRecord.avatar?.srcUrl ?? null,
  }
}

export function formatFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}
