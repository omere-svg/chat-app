import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { ConversationNotFoundError } from '../../conversations/errors/conversation-not-found.error.js'
import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'

export interface ConversationRequest extends Request {
  conversation?: ConversationRecord
}

export const CurrentConversation = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ConversationRecord => {
    const request = context.switchToHttp().getRequest<ConversationRequest>()

    if (request.conversation === undefined) {
      throw new ConversationNotFoundError()
    }

    return request.conversation
  },
)
