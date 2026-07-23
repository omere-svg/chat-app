import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import type { User } from '../users/types/user.js'
import type { UpdateProfileDto } from './DTO/update-profile.dto.js'

@Injectable()
export class UpdateProfileOrchestrator {
  constructor(private readonly usersService: UsersService) {}

  updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateName(userId, {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
    })
  }
}
