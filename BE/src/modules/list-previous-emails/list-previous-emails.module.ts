import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { ListPreviousEmailsOrchestrator } from './list-previous-emails.orchestrator.js'

@Module({
  imports: [UsersModule],
  providers: [ListPreviousEmailsOrchestrator],
  exports: [ListPreviousEmailsOrchestrator],
})
export class ListPreviousEmailsModule {}
