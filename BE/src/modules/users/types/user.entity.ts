export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
}

export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email'>>
