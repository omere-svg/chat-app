import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { RequestAvatarUploadOrchestrator } from '../request-avatar-upload/request-avatar-upload.orchestrator.js'
import { SetAvatarOrchestrator } from '../set-avatar/set-avatar.orchestrator.js'
import { RemoveAvatarOrchestrator } from '../remove-avatar/remove-avatar.orchestrator.js'
import { RequestAvatarUploadDto } from '../users/DTO/request-avatar-upload.dto.js'
import { SetAvatarDto } from '../users/DTO/set-avatar.dto.js'
import type { PublicUser } from '../users/types/user-public-view.js'
import type { AvatarUploadTicket } from '../request-avatar-upload/types/avatar-upload-ticket.js'

@Controller('me/avatar')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private readonly requestAvatarUploadOrchestrator: RequestAvatarUploadOrchestrator,
    private readonly setAvatarOrchestrator: SetAvatarOrchestrator,
    private readonly removeAvatarOrchestrator: RemoveAvatarOrchestrator,
  ) {}

  @Post('upload-url')
  requestUploadUrl(
    @CurrentUser() currentUser: PublicUser,
    @Body() requestAvatarUploadDto: RequestAvatarUploadDto,
  ): Promise<AvatarUploadTicket> {
    return this.requestAvatarUploadOrchestrator.prepare(
      currentUser.id,
      requestAvatarUploadDto.contentType,
    )
  }

  @Put()
  setAvatar(
    @CurrentUser() currentUser: PublicUser,
    @Body() setAvatarDto: SetAvatarDto,
  ): Promise<PublicUser> {
    return this.setAvatarOrchestrator.confirm(currentUser.id, setAvatarDto.key)
  }

  @Delete()
  removeAvatar(@CurrentUser() currentUser: PublicUser): Promise<PublicUser> {
    return this.removeAvatarOrchestrator.remove(currentUser.id)
  }
}
