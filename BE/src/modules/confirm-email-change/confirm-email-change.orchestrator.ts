import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { EmailChangeTokenService } from '../email-change-token/email-change-token.service.js'
import type { User } from '../users/types/user.js'
import type { ConfirmEmailChangeDto } from './DTO/confirm-email-change.dto.js'

@Injectable()
export class ConfirmEmailChangeOrchestrator {
  constructor(
    private readonly emailChangeTokenService: EmailChangeTokenService,
    private readonly usersService: UsersService,
  ) {}

  async confirm({ token }: ConfirmEmailChangeDto): Promise<User> {
    const claims = await this.emailChangeTokenService.verify(token)
    return this.usersService.applyConfirmedEmailChange(claims.userId, claims.newEmail)
  }
}
