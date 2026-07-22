import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class AlreadySubscribedError extends AppException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      ERROR_CODES.SUBSCRIPTION_ALREADY_ACTIVE,
      'This account already has an active subscription',
    )
  }
}
