import type { PasswordResetOtpDocument } from './password-reset-otp.schema.js'
import type { PasswordResetOtpRecord } from './types/password-reset-otp-record.js'

export function toPasswordResetOtpRecord(
  document: PasswordResetOtpDocument,
): PasswordResetOtpRecord {
  return {
    id: document._id,
    userId: document.userId,
    codeHash: document.codeHash,
    expiresAt: document.expiresAt,
    consumedAt: document.consumedAt ?? null,
  }
}
