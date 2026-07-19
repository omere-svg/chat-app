import { Module } from '@nestjs/common'
import { ObjectStorageModule } from '../object-storage/object-storage.module.js'
import { UsersModule } from '../users/users.module.js'
import { RemoveAvatarOrchestrator } from './remove-avatar.orchestrator.js'

@Module({
  imports: [ObjectStorageModule, UsersModule],
  providers: [RemoveAvatarOrchestrator],
  exports: [RemoveAvatarOrchestrator],
})
export class RemoveAvatarModule {}
