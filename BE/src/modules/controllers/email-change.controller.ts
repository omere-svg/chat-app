import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { RequestEmailChangeOrchestrator } from '../request-email-change/request-email-change.orchestrator.js'
import { ConfirmEmailChangeOrchestrator } from '../confirm-email-change/confirm-email-change.orchestrator.js'
import { RequestEmailChangeDto } from '../request-email-change/DTO/request-email-change.dto.js'
import { ConfirmEmailChangeDto } from '../confirm-email-change/DTO/confirm-email-change.dto.js'
import type { User } from '../users/types/user.js'
import type { RequestEmailChangeResult } from '../request-email-change/types/request-email-change-result.js'

@Controller()
export class EmailChangeController {
  constructor(
    private readonly requestEmailChangeOrchestrator: RequestEmailChangeOrchestrator,
    private readonly confirmEmailChangeOrchestrator: ConfirmEmailChangeOrchestrator,
  ) {}

  @Post('me/email-change/request')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtAuthGuard)
  requestEmailChange(
    @CurrentUser() currentUser: User,
    @Body() requestEmailChangeDto: RequestEmailChangeDto,
  ): Promise<RequestEmailChangeResult> {
    return this.requestEmailChangeOrchestrator.request(currentUser.id, requestEmailChangeDto)
  }

  @Post('email-change/confirm')
  @HttpCode(HttpStatus.OK)
  confirmEmailChange(@Body() confirmEmailChangeDto: ConfirmEmailChangeDto): Promise<User> {
    return this.confirmEmailChangeOrchestrator.confirm(confirmEmailChangeDto)
  }
}
