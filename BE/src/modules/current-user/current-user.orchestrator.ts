import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import type { User } from '../users/types/user.js'
import type { UpdateProfileDto } from '../users/DTO/update-profile.dto.js'
import type { UpdateEmailDto } from '../users/DTO/update-email.dto.js'

@Injectable()
export class CurrentUserOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateName(userId, {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
    })
  }

  updateEmail(userId: string, updateEmailDto: UpdateEmailDto): Promise<User> {
    return this.usersService.updateEmail(userId, {
      email: updateEmailDto.email,
      currentPassword: updateEmailDto.currentPassword,
    })
  }
}
