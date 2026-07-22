import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class PaymentProviderError extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_GATEWAY,
      ERROR_CODES.PAYMENT_PROVIDER_ERROR,
      'The payment provider could not start a checkout session',
    )
  }
}
