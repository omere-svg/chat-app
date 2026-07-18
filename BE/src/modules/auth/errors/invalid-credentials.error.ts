import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class InvalidCredentialsError extends AppException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password')
  }
}
