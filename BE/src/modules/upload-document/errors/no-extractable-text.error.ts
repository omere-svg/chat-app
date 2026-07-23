import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class NoExtractableTextError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      'The uploaded document has no extractable text',
    )
  }
}
