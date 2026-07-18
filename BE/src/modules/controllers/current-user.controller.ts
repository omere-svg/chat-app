import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { CurrentUserOrchestrator } from '../current-user/current-user.orchestrator.js'
import { UpdateProfileDto } from '../users/DTO/update-profile.dto.js'
import { UpdateEmailDto } from '../users/DTO/update-email.dto.js'
import type { PublicUser } from '../users/types/user-public-view.js'

@Controller()
@UseGuards(JwtAuthGuard)
export class CurrentUserController {
  constructor(private readonly currentUserOrchestrator: CurrentUserOrchestrator) {}

  @Get('me')
  getCurrentUser(@CurrentUser() currentUser: PublicUser): PublicUser {
    return currentUser
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() currentUser: PublicUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<PublicUser> {
    return this.currentUserOrchestrator.updateProfile(currentUser.id, updateProfileDto)
  }

  @Patch('me/email')
  updateEmail(
    @CurrentUser() currentUser: PublicUser,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<PublicUser> {
    return this.currentUserOrchestrator.updateEmail(currentUser.id, updateEmailDto)
  }
}
