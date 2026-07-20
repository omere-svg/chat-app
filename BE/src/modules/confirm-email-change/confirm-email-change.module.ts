import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { EmailChangeTokenModule } from '../email-change-token/email-change-token.module.js'
import { ConfirmEmailChangeOrchestrator } from './confirm-email-change.orchestrator.js'

@Module({
  imports: [UsersModule, EmailChangeTokenModule],
  providers: [ConfirmEmailChangeOrchestrator],
  exports: [ConfirmEmailChangeOrchestrator],
})
export class ConfirmEmailChangeModule {}
