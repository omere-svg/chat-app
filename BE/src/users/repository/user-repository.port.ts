import type { UserRecord } from '../user.entity.js'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>
  findByEmail(normalizedEmail: string): Promise<UserRecord | null>
  insert(userRecord: UserRecord): Promise<UserRecord>
}
