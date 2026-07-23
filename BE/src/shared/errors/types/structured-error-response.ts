import type { ErrorCode } from '../error-codes.constants.js'

export interface StructuredErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}
