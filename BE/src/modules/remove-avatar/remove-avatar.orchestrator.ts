import { Inject, Injectable } from '@nestjs/common'
import { OBJECT_STORAGE } from '../object-storage/object-storage.tokens.js'
import { deleteObjectBestEffort } from '../object-storage/best-effort-delete.js'
import { UsersService } from '../users/users.service.js'
import type { ObjectStorage } from '../object-storage/types/object-storage.js'
import type { PublicUser } from '../users/types/user-public-view.js'

@Injectable()
export class RemoveAvatarOrchestrator {
  constructor(
    @Inject(OBJECT_STORAGE) private readonly objectStorage: ObjectStorage,
    private readonly usersService: UsersService,
  ) {}

  async remove(userId: string): Promise<PublicUser> {
    const previousKey = await this.usersService.getAvatarKey(userId)
    const updatedUser = await this.usersService.clearAvatar(userId)

    if (previousKey !== null) {
      await deleteObjectBestEffort(this.objectStorage, previousKey)
    }

    return updatedUser
  }
}
