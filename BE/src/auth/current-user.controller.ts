import { Controller, Get, UseGuards } from '@nestjs/common'
import { CurrentUser } from './decorator/current-user.decorator.js'
import { JwtAuthGuard } from './guard/jwt-auth.guard.js'
import type { PublicUser } from '../users/user-public-view.js'

@Controller()
export class CurrentUserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() currentUser: PublicUser): PublicUser {
    return currentUser
  }
}
