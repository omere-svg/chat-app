import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class ConversationConflictError extends AppException {
  constructor(conversationId: string) {
    super(
      HttpStatus.CONFLICT,
      ERROR_CODES.CONVERSATION_CONFLICT,
      'A conversation with these participants already exists',
      { conversationId },
    )
  }
}
