import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { CurrentUserOrchestrator } from '../current-user/current-user.orchestrator.js'
import { UpdateProfileDto } from '../users/DTO/update-profile.dto.js'
import { UpdateEmailDto } from '../users/DTO/update-email.dto.js'
import type { User } from '../users/types/user.js'

@Controller()
@UseGuards(JwtAuthGuard)
export class CurrentUserController {
  constructor(private readonly currentUserOrchestrator: CurrentUserOrchestrator) {}

  @Get('me')
  getCurrentUser(@CurrentUser() currentUser: User): User {
    return currentUser
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() currentUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.currentUserOrchestrator.updateProfile(currentUser.id, updateProfileDto)
  }

  @Patch('me/email')
  updateEmail(
    @CurrentUser() currentUser: User,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    return this.currentUserOrchestrator.updateEmail(currentUser.id, updateEmailDto)
  }
}
