import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { RequestPasswordResetOrchestrator } from '../request-password-reset/request-password-reset.orchestrator.js'
import { ConfirmPasswordResetOrchestrator } from '../confirm-password-reset/confirm-password-reset.orchestrator.js'
import { RequestPasswordResetDto } from '../request-password-reset/DTO/request-password-reset.dto.js'
import { ConfirmPasswordResetDto } from '../confirm-password-reset/DTO/confirm-password-reset.dto.js'
import type { RequestPasswordResetResult } from '../request-password-reset/types/request-password-reset-result.js'
import type { ConfirmPasswordResetResult } from '../confirm-password-reset/types/confirm-password-reset-result.js'

@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(
    private readonly requestPasswordResetOrchestrator: RequestPasswordResetOrchestrator,
    private readonly confirmPasswordResetOrchestrator: ConfirmPasswordResetOrchestrator,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.ACCEPTED)
  requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResult> {
    return this.requestPasswordResetOrchestrator.request(requestPasswordResetDto)
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmPasswordReset(
    @Body() confirmPasswordResetDto: ConfirmPasswordResetDto,
  ): Promise<ConfirmPasswordResetResult> {
    return this.confirmPasswordResetOrchestrator.confirm(confirmPasswordResetDto)
  }
}
