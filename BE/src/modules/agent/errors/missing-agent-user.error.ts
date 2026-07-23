import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class MissingAgentUserError extends AppException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      'Agent run is missing a userId in its configurable',
    )
  }
}
