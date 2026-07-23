import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module.js'
import { UpdateProfileOrchestrator } from './update-profile.orchestrator.js'

@Module({
  imports: [UsersModule],
  providers: [UpdateProfileOrchestrator],
  exports: [UpdateProfileOrchestrator],
})
export class UpdateProfileModule {}
