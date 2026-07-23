import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../../shared/errors/error-codes.constants.js'

export class AvatarObjectNotFoundError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.AVATAR_NOT_UPLOADED,
      'No uploaded avatar was found for the provided key',
    )
  }
}
