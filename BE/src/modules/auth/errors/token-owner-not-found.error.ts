import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class TokenOwnerNotFoundError extends AppException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      'Account associated with this token no longer exists',
    )
  }
}
