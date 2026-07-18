import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class MissingUploadFileError extends AppException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, 'No file was uploaded under field "file"')
  }
}
