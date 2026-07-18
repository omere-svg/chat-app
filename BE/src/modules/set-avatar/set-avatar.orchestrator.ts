import { Inject, Injectable } from '@nestjs/common'
import { OBJECT_STORAGE } from '../object-storage/object-storage.tokens.js'
import { UsersService } from '../users/users.service.js'
import { AvatarUrlResolver } from '../users/avatar-url.resolver.js'
import { isAllowedAvatarContentType, isAvatarKeyOwnedBy } from '../users/avatar/avatar-key.js'
import { MAX_AVATAR_BYTES } from '../users/avatar/constants.js'
import { AvatarKeyForbiddenError } from '../users/avatar/errors/avatar-key-forbidden.error.js'
import { AvatarObjectNotFoundError } from '../users/avatar/errors/avatar-object-not-found.error.js'
import { AvatarTooLargeError } from '../users/avatar/errors/avatar-too-large.error.js'
import { UnsupportedImageTypeError } from '../users/avatar/errors/unsupported-image-type.error.js'
import type { ObjectStorage } from '../object-storage/types/object-storage.js'
import type { PublicUser } from '../users/types/user-public-view.js'

@Injectable()
export class SetAvatarOrchestrator {
  constructor(
    @Inject(OBJECT_STORAGE) private readonly objectStorage: ObjectStorage,
    private readonly usersService: UsersService,
    private readonly avatarUrlResolver: AvatarUrlResolver,
  ) {}

  async confirm(userId: string, key: string): Promise<PublicUser> {
    if (!isAvatarKeyOwnedBy(userId, key)) {
      throw new AvatarKeyForbiddenError()
    }

    await this.assertUploadedObjectIsValid(key)

    const srcUrl = this.avatarUrlResolver.resolve(key, Date.now().toString())
    return this.usersService.updateAvatar(userId, { srcUrl, key })
  }

  private async assertUploadedObjectIsValid(key: string): Promise<void> {
    const storedObject = await this.objectStorage.headObject(key)
    if (storedObject === null) {
      throw new AvatarObjectNotFoundError()
    }

    if (storedObject.byteSize > MAX_AVATAR_BYTES) {
      await this.objectStorage.deleteObject(key)
      throw new AvatarTooLargeError()
    }

    if (storedObject.contentType !== null && !isAllowedAvatarContentType(storedObject.contentType)) {
      await this.objectStorage.deleteObject(key)
      throw new UnsupportedImageTypeError()
    }
  }
}
