import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { UpdateProfileOrchestrator } from '../update-profile/update-profile.orchestrator.js'
import { ListPreviousEmailsOrchestrator } from '../list-previous-emails/list-previous-emails.orchestrator.js'
import { UpdateProfileDto } from '../update-profile/DTO/update-profile.dto.js'
import type { User } from '../users/types/user.js'
import type { PreviousEmailsView } from '../list-previous-emails/types/previous-emails.view.js'

@Controller()
@UseGuards(JwtAuthGuard)
export class CurrentUserController {
  constructor(
    private readonly updateProfileOrchestrator: UpdateProfileOrchestrator,
    private readonly listPreviousEmailsOrchestrator: ListPreviousEmailsOrchestrator,
  ) {}

  @Get('me')
  getCurrentUser(@CurrentUser() currentUser: User): User {
    return currentUser
  }

  @Get('me/previous-emails')
  getPreviousEmails(@CurrentUser() currentUser: User): Promise<PreviousEmailsView> {
    return this.listPreviousEmailsOrchestrator.list(currentUser.id)
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() currentUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.updateProfileOrchestrator.updateProfile(currentUser.id, updateProfileDto)
  }
}
