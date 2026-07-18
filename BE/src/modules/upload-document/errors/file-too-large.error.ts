import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'
import { MAX_UPLOAD_BYTES } from '../../knowledge-rag/ingestion/supported-formats.js'

export class FileTooLargeError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      `File exceeds the ${MAX_UPLOAD_BYTES}-byte limit`,
    )
  }
}
