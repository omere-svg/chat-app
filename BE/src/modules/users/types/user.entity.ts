import type { StoredAvatar } from './stored-avatar.js'

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatar: StoredAvatar | null
  previousEmails: string[]
  sessionsInvalidatedAt?: Date | null
}

export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'avatar'>>

export interface ConfirmedEmailChange {
  userId: string
  newEmail: string
}

export interface PasswordReset {
  userId: string
  passwordHash: string
  sessionsInvalidatedAt: Date
}
