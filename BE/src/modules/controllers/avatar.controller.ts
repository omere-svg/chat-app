import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { RequestAvatarUploadOrchestrator } from '../request-avatar-upload/request-avatar-upload.orchestrator.js'
import { SetAvatarOrchestrator } from '../set-avatar/set-avatar.orchestrator.js'
import { RemoveAvatarOrchestrator } from '../remove-avatar/remove-avatar.orchestrator.js'
import { RequestAvatarUploadDto } from '../request-avatar-upload/DTO/request-avatar-upload.dto.js'
import { SetAvatarDto } from '../set-avatar/DTO/set-avatar.dto.js'
import type { User } from '../users/types/user.js'
import type { AvatarResult } from '../users/types/avatar-result.js'
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
    @CurrentUser() currentUser: User,
    @Body() requestAvatarUploadDto: RequestAvatarUploadDto,
  ): Promise<AvatarUploadTicket> {
    return this.requestAvatarUploadOrchestrator.prepare(
      currentUser.id,
      requestAvatarUploadDto.contentType,
    )
  }

  @Put()
  setAvatar(
    @CurrentUser() currentUser: User,
    @Body() setAvatarDto: SetAvatarDto,
  ): Promise<AvatarResult> {
    return this.setAvatarOrchestrator.confirm(currentUser.id, setAvatarDto.key)
  }

  @Delete()
  removeAvatar(@CurrentUser() currentUser: User): Promise<AvatarResult> {
    return this.removeAvatarOrchestrator.remove(currentUser.id)
  }
}
