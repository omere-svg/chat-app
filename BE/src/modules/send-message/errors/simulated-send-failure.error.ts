import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constants.js'

export class SimulatedSendFailureError extends AppException {
  constructor() {
    super(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_CODES.SIMULATED_SEND_FAILURE, 'Simulated send failure')
  }
}
