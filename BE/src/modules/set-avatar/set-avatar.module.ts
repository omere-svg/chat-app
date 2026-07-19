import { Module } from '@nestjs/common'
import { ObjectStorageModule } from '../object-storage/object-storage.module.js'
import { UsersModule } from '../users/users.module.js'
import { SetAvatarOrchestrator } from './set-avatar.orchestrator.js'

@Module({
  imports: [ObjectStorageModule, UsersModule],
  providers: [SetAvatarOrchestrator],
  exports: [SetAvatarOrchestrator],
})
export class SetAvatarModule {}
