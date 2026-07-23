import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../../shared/errors/error-codes.constants.js'
import { ALLOWED_AVATAR_CONTENT_TYPES } from '../constants.js'

export class UnsupportedImageTypeError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.UNSUPPORTED_IMAGE_TYPE,
      `Avatar must be one of: ${Object.keys(ALLOWED_AVATAR_CONTENT_TYPES).join(', ')}`,
    )
  }
}
