import { HttpException } from '@nestjs/common'
import type { ErrorCode } from './error-codes.constant.js'

export class AppException extends HttpException {
  readonly code: ErrorCode
  readonly details?: unknown

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message, status)
    this.code = code
    this.details = details
  }
}
