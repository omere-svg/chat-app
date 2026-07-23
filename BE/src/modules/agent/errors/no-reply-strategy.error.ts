import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'
import type { ConversationType } from '../../../modules/conversations/types/conversation.entity.js'

export class NoReplyStrategyError extends AppException {
  constructor(conversationType: ConversationType) {
    super(
      HttpStatus.NOT_FOUND,
      ERROR_CODES.CONVERSATION_NOT_FOUND,
      `No assistant is available for ${conversationType} conversations`,
    )
  }
}
