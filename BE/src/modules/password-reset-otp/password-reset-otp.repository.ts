import type { PasswordResetOtpRecord } from './types/password-reset-otp-record.js'

export const PASSWORD_RESET_OTP_REPOSITORY = Symbol('PASSWORD_RESET_OTP_REPOSITORY')

export interface PasswordResetOtpRepository {
  deleteByUserId(userId: string): Promise<void>
  insert(record: PasswordResetOtpRecord): Promise<void>
  findActiveByUserId(userId: string, now: Date): Promise<PasswordResetOtpRecord | null>
  consume(id: string, consumedAt: Date): Promise<boolean>
}
