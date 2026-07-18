import { Inject, Injectable } from '@nestjs/common'
import { OBJECT_STORAGE } from '../object-storage/object-storage.tokens.js'
import {
  buildAvatarKey,
  isAllowedAvatarContentType,
} from '../users/avatar/avatar-key.js'
import { UnsupportedImageTypeError } from '../users/avatar/errors/unsupported-image-type.error.js'
import type { ObjectStorage } from '../object-storage/types/object-storage.js'
import type { AvatarUploadTicket } from './types/avatar-upload-ticket.js'

@Injectable()
export class RequestAvatarUploadOrchestrator {
  constructor(@Inject(OBJECT_STORAGE) private readonly objectStorage: ObjectStorage) {}

  async prepare(userId: string, contentType: string): Promise<AvatarUploadTicket> {
    if (!isAllowedAvatarContentType(contentType)) {
      throw new UnsupportedImageTypeError()
    }

    const key = buildAvatarKey(userId, contentType)
    const { uploadUrl, expiresInSeconds } = await this.objectStorage.createUploadUrl({
      key,
      contentType,
    })

    return { uploadUrl, key, expiresInSeconds }
  }
}
