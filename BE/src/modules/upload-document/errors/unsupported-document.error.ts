import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'
import { SUPPORTED_EXTENSIONS } from '../../knowledge-rag/ingestion/supported-formats.js'

export class UnsupportedDocumentError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.UNSUPPORTED_DOCUMENT,
      `Only ${SUPPORTED_EXTENSIONS.join(', ')} files are supported`,
    )
  }
}
