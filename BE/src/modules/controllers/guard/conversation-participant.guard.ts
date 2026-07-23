import { Injectable } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { AuthenticationRequiredError } from '../../auth/errors/authentication-required.error.js'
import { ConversationNotFoundError } from '../../conversations/errors/conversation-not-found.error.js'
import { ConversationsService } from '../../conversations/conversations.service.js'
import type { ParticipantGuardRequest } from '../types/participant-guard-request.js'

@Injectable()
export class ConversationParticipantGuard implements CanActivate {
  constructor(private readonly conversationsService: ConversationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ParticipantGuardRequest>()

    const currentUser = request.user
    if (currentUser === undefined) {
      throw new AuthenticationRequiredError()
    }

    const conversationId = request.params.conversationId
    if (typeof conversationId !== 'string' || conversationId.length === 0) {
      throw new ConversationNotFoundError()
    }

    request.conversation = await this.conversationsService.getParticipantConversationOrThrow({
      conversationId,
      userId: currentUser.id,
    })
    return true
  }
}
