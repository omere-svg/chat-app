import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../../shared/errors/error-codes.constant.js'

export class AvatarKeyForbiddenError extends AppException {
  constructor() {
    super(HttpStatus.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'Avatar key does not belong to this user')
  }
}
