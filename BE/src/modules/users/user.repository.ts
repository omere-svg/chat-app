import type { ConfirmedEmailChange, UserRecord, UserUpdate } from './types/user.entity.js'
import type { ConfirmedEmailChangeResult } from './types/confirmed-email-change-result.js'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface UserRepository {
  isEmpty(): Promise<boolean>
  findById(userId: string): Promise<UserRecord | null>
  findByEmail(normalizedEmail: string): Promise<UserRecord | null>
  findByEmails(normalizedEmails: readonly string[]): Promise<UserRecord[]>
  findByIds(userIds: readonly string[]): Promise<UserRecord[]>
  insert(userRecord: UserRecord): Promise<UserRecord>
  update(userId: string, patch: UserUpdate): Promise<UserRecord | null>
  applyConfirmedEmailChange(change: ConfirmedEmailChange): Promise<ConfirmedEmailChangeResult>
}
