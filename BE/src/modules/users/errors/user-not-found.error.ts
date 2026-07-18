import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class UserNotFoundError extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.USER_NOT_FOUND, 'User not found')
  }
}
