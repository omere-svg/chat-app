import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import type { PublicUser } from '../users/types/user-public-view.js'
import type { UpdateProfileDto } from '../users/DTO/update-profile.dto.js'
import type { UpdateEmailDto } from '../users/DTO/update-email.dto.js'

@Injectable()
export class CurrentUserOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<PublicUser> {
    return this.usersService.updateName(userId, {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
    })
  }

  updateEmail(userId: string, updateEmailDto: UpdateEmailDto): Promise<PublicUser> {
    return this.usersService.updateEmail(userId, {
      email: updateEmailDto.email,
      currentPassword: updateEmailDto.currentPassword,
    })
  }
}
