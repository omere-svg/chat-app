import { Module } from '@nestjs/common'
import { ObjectStorageModule } from '../object-storage/object-storage.module.js'
import { RequestAvatarUploadOrchestrator } from './request-avatar-upload.orchestrator.js'

@Module({
  imports: [ObjectStorageModule],
  providers: [RequestAvatarUploadOrchestrator],
  exports: [RequestAvatarUploadOrchestrator],
})
export class RequestAvatarUploadModule {}
