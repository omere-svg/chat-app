import { Module } from '@nestjs/common'
import { OBJECT_STORAGE } from './object-storage.tokens.js'
import { S3ObjectStorage } from './s3-object-storage.js'

@Module({
  providers: [{ provide: OBJECT_STORAGE, useClass: S3ObjectStorage }],
  exports: [OBJECT_STORAGE],
})
export class ObjectStorageModule {}
