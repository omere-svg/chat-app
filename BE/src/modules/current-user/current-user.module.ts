import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { CurrentUserOrchestrator } from './current-user.orchestrator.js'

@Module({
  imports: [UsersModule],
  providers: [CurrentUserOrchestrator],
  exports: [CurrentUserOrchestrator],
})
export class CurrentUserModule {}
