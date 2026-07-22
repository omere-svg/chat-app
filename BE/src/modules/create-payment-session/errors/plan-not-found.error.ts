import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class PlanNotFoundError extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.PLAN_NOT_FOUND, 'The requested plan does not exist')
  }
}
