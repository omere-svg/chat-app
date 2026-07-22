import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { PasswordResetOtpModule } from '../password-reset-otp/password-reset-otp.module.js'
import { EmailSenderModule } from '../email-sender/email-sender.module.js'
import { RequestPasswordResetOrchestrator } from './request-password-reset.orchestrator.js'

@Module({
  imports: [UsersModule, PasswordResetOtpModule, EmailSenderModule],
  providers: [RequestPasswordResetOrchestrator],
  exports: [RequestPasswordResetOrchestrator],
})
export class RequestPasswordResetModule {}
