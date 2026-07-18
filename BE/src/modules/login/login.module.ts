import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { LoginOrchestrator } from './login.orchestrator.js'

@Module({
  imports: [UsersModule, AuthModule],
  providers: [LoginOrchestrator],
  exports: [LoginOrchestrator],
})
export class LoginModule {}
