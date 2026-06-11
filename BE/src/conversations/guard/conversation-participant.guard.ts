import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import { ConversationsService } from '../conversations.service.js'
import type { PublicUser } from '../../users/user-public-view.js'

interface ParticipantGuardRequest extends Request {
  user?: PublicUser
}

@Injectable()
export class ConversationParticipantGuard implements CanActivate {
  constructor(private readonly conversationsService: ConversationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ParticipantGuardRequest>()

    const currentUser = request.user
    if (currentUser === undefined) {
      throw new UnauthorizedException({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication is required',
      })
    }

    const conversationId = request.params.conversationId
    if (typeof conversationId !== 'string' || conversationId.length === 0) {
      throw new NotFoundException({
        code: ERROR_CODES.CONVERSATION_NOT_FOUND,
        message: 'Conversation not found',
      })
    }

    await this.conversationsService.assertParticipantConversation(conversationId, currentUser.id)
    return true
  }
}
