import type { UserRecord } from '../user.entity.js'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

// Fields a user is allowed to change after signup. Excludes id/passwordHash, which are
// never mutated through the profile update path.
export type UserUpdate = Partial<Pick<UserRecord, 'firstName' | 'lastName' | 'email'>>

export interface UserRepository {
  isEmpty(): Promise<boolean>
  findById(userId: string): Promise<UserRecord | null>
  findByEmail(normalizedEmail: string): Promise<UserRecord | null>
  findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]>
  findByIds(userIds: readonly string[]): Promise<UserRecord[]>
  insert(userRecord: UserRecord): Promise<UserRecord>
  // Applies a partial update and returns the updated record, or null if the user is gone.
  update(userId: string, patch: UserUpdate): Promise<UserRecord | null>
}
