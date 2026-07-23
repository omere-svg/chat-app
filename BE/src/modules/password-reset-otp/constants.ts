export const OTP_CODE_LENGTH = 6

export const OTP_TTL_SECONDS = 60 * 10

export const OTP_HASH_SALT_ROUNDS = 12

export const PASSWORD_RESET_OTP_COLLECTION_NAME = 'password_reset_otps'

export const PASSWORD_RESET_OTP_USER_INDEX_NAME = 'password_reset_otp_user'

export const PASSWORD_RESET_OTP_EXPIRY_INDEX_NAME = 'password_reset_otp_expiry_ttl'

export const OTP_OUTCOME = {
  valid: 'valid',
  invalid: 'invalid',
} as const
