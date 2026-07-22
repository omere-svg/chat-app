export interface PasswordResetOtpRecord {
  id: string
  userId: string
  codeHash: string
  expiresAt: Date
  consumedAt: Date | null
}
