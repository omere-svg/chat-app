import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class EmailChangeTokenInvalidError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.EMAIL_CHANGE_TOKEN_INVALID,
      'The email confirmation link is invalid or has expired',
    )
  }
}
