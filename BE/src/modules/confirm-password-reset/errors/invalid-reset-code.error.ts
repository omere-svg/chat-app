import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class InvalidResetCodeError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.PASSWORD_RESET_CODE_INVALID,
      'The reset code is invalid or has expired',
    )
  }
}
