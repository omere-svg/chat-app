import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class MissingAuthenticatedUserError extends AppException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'No authenticated user on request')
  }
}
