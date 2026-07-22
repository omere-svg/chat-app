import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class SessionRevokedError extends AppException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      'Your session is no longer valid; sign in again',
    )
  }
}
