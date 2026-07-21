import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { EmailChangeTokenModule } from '../email-change-token/email-change-token.module.js'
import { EmailSenderModule } from '../email-sender/email-sender.module.js'
import { RequestEmailChangeOrchestrator } from './request-email-change.orchestrator.js'

@Module({
  imports: [UsersModule, EmailChangeTokenModule, EmailSenderModule],
  providers: [RequestEmailChangeOrchestrator],
  exports: [RequestEmailChangeOrchestrator],
})
export class RequestEmailChangeModule {}
