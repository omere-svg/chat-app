import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class NotAParticipantError extends AppException {
  constructor() {
    super(HttpStatus.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'You are not a participant in this conversation')
  }
}
