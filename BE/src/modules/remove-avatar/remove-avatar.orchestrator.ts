import { Inject, Injectable } from '@nestjs/common'
import { OBJECT_STORAGE } from '../object-storage/object-storage.tokens.js'
import { UsersService } from '../users/users.service.js'
import type { ObjectStorage } from '../object-storage/types/object-storage.js'
import type { AvatarResult } from '../users/types/avatar-result.js'

@Injectable()
export class RemoveAvatarOrchestrator {
  constructor(
    @Inject(OBJECT_STORAGE) private readonly objectStorage: ObjectStorage,
    private readonly usersService: UsersService,
  ) {}

  async remove(userId: string): Promise<AvatarResult> {
    const previousUser = await this.usersService.getUserRecord(userId)
    const previousKey = previousUser.avatar?.key ?? null
    const updatedUser = await this.usersService.clearAvatar(userId)

    if (previousKey !== null) {
      await this.objectStorage.deleteObjectQuietly(previousKey)
    }

    return { avatarUrl: updatedUser.avatarUrl }
  }
}
