import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { SignupOrchestrator } from './signup.orchestrator.js'

@Module({
  imports: [UsersModule, AuthModule],
  providers: [SignupOrchestrator],
  exports: [SignupOrchestrator],
})
export class SignupModule {}
