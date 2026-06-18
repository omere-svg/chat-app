import type { UserRecord } from '../user.entity.js'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface UserRepository {
  isEmpty(): Promise<boolean>
  findById(userId: string): Promise<UserRecord | null>
  findByEmail(normalizedEmail: string): Promise<UserRecord | null>
  findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]>
  insert(userRecord: UserRecord): Promise<UserRecord>
}
