import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class EmailAlreadyRegisteredError extends AppException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      ERROR_CODES.EMAIL_ALREADY_REGISTERED,
      'An account with this email already exists',
    )
  }
}
