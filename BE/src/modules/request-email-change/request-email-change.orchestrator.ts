import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service.js'
import { EmailChangeTokenService } from '../email-change-token/email-change-token.service.js'
import { EMAIL_SENDER } from '../email-sender/email-sender.tokens.js'
import { buildConfirmationEmail } from './confirmation-email.js'
import { buildConfirmationUrl } from './confirmation-url.builder.js'
import { EmailUnchangedError } from './errors/email-unchanged.error.js'
import { EMAIL_CHANGE_REQUEST_STATUS } from './constants.js'
import { normalizeEmail } from '../../shared/validation/normalize-email.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { EmailSender } from '../email-sender/types/email-sender.js'
import type { RequestEmailChangeDto } from './DTO/request-email-change.dto.js'
import type { RequestEmailChangeResult } from './types/request-email-change-result.js'

@Injectable()
export class RequestEmailChangeOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailChangeTokenService: EmailChangeTokenService,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async request(
    userId: string,
    { newEmail }: RequestEmailChangeDto,
  ): Promise<RequestEmailChangeResult> {
    const normalizedEmail = normalizeEmail(newEmail)
    const currentUser = await this.usersService.getUserRecord(userId)
    if (normalizedEmail === normalizeEmail(currentUser.email)) {
      throw new EmailUnchangedError()
    }

    await this.usersService.assertEmailAvailable(normalizedEmail, userId)

    const token = await this.emailChangeTokenService.issue({ userId, newEmail: normalizedEmail })
    const frontendOrigin = this.configService.get('FRONTEND_ORIGIN', { infer: true })
    const confirmationUrl = buildConfirmationUrl(frontendOrigin, token)

    await this.emailSender.send(buildConfirmationEmail({ newEmail: normalizedEmail, confirmationUrl }))

    return { status: EMAIL_CHANGE_REQUEST_STATUS }
  }
}
