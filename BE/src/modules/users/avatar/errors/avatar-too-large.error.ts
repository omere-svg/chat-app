import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../../shared/errors/error-codes.constant.js'
import { MAX_AVATAR_BYTES } from '../constants.js'

export class AvatarTooLargeError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.AVATAR_TOO_LARGE,
      `Avatar exceeds the ${MAX_AVATAR_BYTES.toString()}-byte limit`,
    )
  }
}
