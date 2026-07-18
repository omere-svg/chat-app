import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class ConversationNotFoundError extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.CONVERSATION_NOT_FOUND, 'Conversation not found')
  }
}
