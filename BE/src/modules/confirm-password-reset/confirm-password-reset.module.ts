import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { PasswordResetOtpModule } from '../password-reset-otp/password-reset-otp.module.js'
import { ConfirmPasswordResetOrchestrator } from './confirm-password-reset.orchestrator.js'

@Module({
  imports: [UsersModule, PasswordResetOtpModule],
  providers: [ConfirmPasswordResetOrchestrator],
  exports: [ConfirmPasswordResetOrchestrator],
})
export class ConfirmPasswordResetModule {}
