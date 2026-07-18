import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class InvalidCursorError extends AppException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.INVALID_CURSOR, 'Pagination cursor is invalid or expired')
  }
}
