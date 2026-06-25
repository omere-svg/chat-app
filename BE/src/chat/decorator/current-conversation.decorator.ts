import { NotFoundException, createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import type { ConversationRecord } from '../../conversations/conversation.entity.js'


export interface ConversationRequest extends Request {
  conversation?: ConversationRecord
}

export const CurrentConversation = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ConversationRecord => {
    const request = context.switchToHttp().getRequest<ConversationRequest>()

    if (request.conversation === undefined) {
      throw new NotFoundException({
        code: ERROR_CODES.CONVERSATION_NOT_FOUND,
        message: 'Conversation not found',
      })
    }

    return request.conversation
  },
)
