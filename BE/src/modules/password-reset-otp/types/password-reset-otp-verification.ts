import type { OTP_OUTCOME } from '../constants.js'

export type PasswordResetOtpVerification =
  | { outcome: typeof OTP_OUTCOME.valid }
  | { outcome: typeof OTP_OUTCOME.invalid }
