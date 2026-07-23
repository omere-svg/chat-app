import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { OtpCodeHasher } from './otp-code.hasher.js'
import { PASSWORD_RESET_OTP_REPOSITORY } from './password-reset-otp.repository.js'
import { generateOtpCode } from './generate-otp-code.js'
import { OTP_OUTCOME, OTP_TTL_SECONDS } from './constants.js'
import type { PasswordResetOtpRepository } from './password-reset-otp.repository.js'
import type { VerifyPasswordResetOtpInput } from './types/verify-password-reset-otp-input.js'
import type { PasswordResetOtpVerification } from './types/password-reset-otp-verification.js'

@Injectable()
export class PasswordResetOtpService {
  constructor(
    @Inject(PASSWORD_RESET_OTP_REPOSITORY)
    private readonly passwordResetOtpRepository: PasswordResetOtpRepository,
    private readonly otpCodeHasher: OtpCodeHasher,
  ) {}

  async issue(userId: string): Promise<string> {
    await this.passwordResetOtpRepository.deleteByUserId(userId)

    const code = generateOtpCode()
    const codeHash = await this.otpCodeHasher.hash(code)
    const now = new Date()

    await this.passwordResetOtpRepository.insert({
      id: `otp-${randomUUID()}`,
      userId,
      codeHash,
      expiresAt: new Date(now.getTime() + OTP_TTL_SECONDS * 1000),
      consumedAt: null,
    })

    return code
  }

  async verifyAndConsume({
    userId,
    code,
  }: VerifyPasswordResetOtpInput): Promise<PasswordResetOtpVerification> {
    const now = new Date()
    const record = await this.passwordResetOtpRepository.findActiveByUserId(userId, now)
    if (record === null) {
      return { outcome: OTP_OUTCOME.invalid }
    }

    const codeMatches = await this.otpCodeHasher.verify(code, record.codeHash)
    if (!codeMatches) {
      return { outcome: OTP_OUTCOME.invalid }
    }

    const consumed = await this.passwordResetOtpRepository.consume(record.id, now)
    return consumed ? { outcome: OTP_OUTCOME.valid } : { outcome: OTP_OUTCOME.invalid }
  }
}
