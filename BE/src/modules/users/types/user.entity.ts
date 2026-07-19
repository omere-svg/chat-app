import type { StoredAvatar } from './stored-avatar.js'

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatar: StoredAvatar | null
}

export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'avatar'>>
