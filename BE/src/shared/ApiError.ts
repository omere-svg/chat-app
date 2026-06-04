import { ERROR_CODES } from './errorCodes.js'
import type { ErrorCode } from './errorCodes.js'

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly details?: unknown

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, message, details)
  }

  static unauthorized(message = 'Missing or invalid token'): ApiError {
    return new ApiError(401, ERROR_CODES.UNAUTHORIZED, message)
  }

  static forbidden(message = 'Not a participant in this conversation'): ApiError {
    return new ApiError(403, ERROR_CODES.FORBIDDEN, message)
  }

  static userNotFound(message = 'User not found'): ApiError {
    return new ApiError(404, ERROR_CODES.USER_NOT_FOUND, message)
  }

  static conversationNotFound(message = 'Conversation not found'): ApiError {
    return new ApiError(404, ERROR_CODES.CONVERSATION_NOT_FOUND, message)
  }

  static invalidCursor(message = 'Pagination cursor is invalid or expired'): ApiError {
    return new ApiError(400, ERROR_CODES.INVALID_CURSOR, message)
  }

  static conversationConflict(existingConversationId: string): ApiError {
    return new ApiError(
      409,
      ERROR_CODES.CONVERSATION_CONFLICT,
      'A conversation with these participants already exists',
      { conversationId: existingConversationId },
    )
  }

  static simulatedSendFailure(message = 'Simulated send failure'): ApiError {
    return new ApiError(500, ERROR_CODES.SIMULATED_SEND_FAILURE, message)
  }
}
