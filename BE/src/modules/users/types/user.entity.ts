import type { StoredAvatar } from './stored-avatar.js'

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatar: StoredAvatar | null
  previousEmails: string[]
}

export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'avatar'>>

export interface ConfirmedEmailChange {
  userId: string
  newEmail: string
}
