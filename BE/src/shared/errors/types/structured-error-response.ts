import type { ErrorCode } from '../error-codes.constant.js'

export interface StructuredErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}
