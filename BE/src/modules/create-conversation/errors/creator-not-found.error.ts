import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class CreatorNotFoundError extends AppException {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'Authenticated user could not be found')
  }
}
