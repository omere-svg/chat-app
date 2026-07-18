export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  avatarKey: string | null
}

export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email' | 'avatarKey'>>
