import { Inject, Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { PasswordResetOtpService } from '../password-reset-otp/password-reset-otp.service.js'
import { EMAIL_SENDER } from '../email-sender/email-sender.tokens.js'
import { buildResetCodeEmail } from './reset-code-email.js'
import { PASSWORD_RESET_REQUEST_STATUS } from './constants.js'
import type { EmailSender } from '../email-sender/types/email-sender.js'
import type { RequestPasswordResetDto } from './DTO/request-password-reset.dto.js'
import type { RequestPasswordResetResult } from './types/request-password-reset-result.js'

@Injectable()
export class RequestPasswordResetOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetOtpService: PasswordResetOtpService,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
  ) {}

  async request({ email }: RequestPasswordResetDto): Promise<RequestPasswordResetResult> {
    const user = await this.usersService.findRecordByEmail(email)

    if (user !== null) {
      const code = await this.passwordResetOtpService.issue(user.id)
      await this.emailSender.send(buildResetCodeEmail({ to: user.email, code }))
    }

    return { status: PASSWORD_RESET_REQUEST_STATUS }
  }
}
