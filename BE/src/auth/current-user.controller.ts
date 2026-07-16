import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { UpdateEmailDto } from '../users/dto/update-email.dto.js'
import { UpdateProfileDto } from '../users/dto/update-profile.dto.js'
import { CurrentUser } from './decorator/current-user.decorator.js'
import { JwtAuthGuard } from './guard/jwt-auth.guard.js'
import type { PublicUser } from '../users/user-public-view.js'

@Controller()
@UseGuards(JwtAuthGuard)
export class CurrentUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() currentUser: PublicUser): PublicUser {
    return currentUser
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() currentUser: PublicUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<PublicUser> {
    return this.usersService.updateName(currentUser.id, {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
    })
  }

  @Patch('me/email')
  updateEmail(
    @CurrentUser() currentUser: PublicUser,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<PublicUser> {
    return this.usersService.updateEmail(currentUser.id, {
      email: updateEmailDto.email,
      currentPassword: updateEmailDto.currentPassword,
    })
  }
}
