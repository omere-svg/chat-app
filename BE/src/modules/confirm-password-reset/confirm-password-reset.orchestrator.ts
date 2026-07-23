import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { PasswordResetOtpService } from '../password-reset-otp/password-reset-otp.service.js'
import { OTP_OUTCOME } from '../password-reset-otp/constants.js'
import { InvalidResetCodeError } from './errors/invalid-reset-code.error.js'
import { PASSWORD_RESET_CONFIRM_STATUS } from './constants.js'
import type { ConfirmPasswordResetDto } from './DTO/confirm-password-reset.dto.js'
import type { ConfirmPasswordResetResult } from './types/confirm-password-reset-result.js'

@Injectable()
export class ConfirmPasswordResetOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetOtpService: PasswordResetOtpService,
  ) {}

  async confirm({
    email,
    code,
    newPassword,
  }: ConfirmPasswordResetDto): Promise<ConfirmPasswordResetResult> {
    const user = await this.usersService.findRecordByEmail(email)
    if (user === null) {
      throw new InvalidResetCodeError()
    }

    const verification = await this.passwordResetOtpService.verifyAndConsume({
      userId: user.id,
      code,
    })
    if (verification.outcome !== OTP_OUTCOME.valid) {
      throw new InvalidResetCodeError()
    }

    await this.usersService.resetPassword(user.id, newPassword)
    return { status: PASSWORD_RESET_CONFIRM_STATUS }
  }
}
