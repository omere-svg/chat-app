import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { AppException } from './app.exception.js'
import { ERROR_CODES } from './error-codes.constant.js'
import type { ErrorCode } from './error-codes.constant.js'

interface StructuredErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set<string>(Object.values(ERROR_CODES))

const HTTP_SERVER_ERROR_THRESHOLD = 500

const STATUS_TO_ERROR_CODE: Readonly<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_ERROR,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.ROUTE_NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.CONVERSATION_CONFLICT,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isErrorCode(value: string): value is ErrorCode {
  return KNOWN_ERROR_CODES.has(value)
}

@Catch()
export class StructuredExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StructuredExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const { status, body } = this.serializeException(exception)

    if (status >= HTTP_SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        `Unhandled exception resulted in HTTP ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    response.status(status).json(body)
  }

  private serializeException(exception: unknown): {
    status: number
    body: StructuredErrorResponse
  } {
    if (exception instanceof AppException) {
      const { code, message, details } = exception
      return {
        status: exception.getStatus(),
        body: {
          error: details === undefined ? { code, message } : { code, message, details },
        },
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      const code = this.resolveErrorCode(status, exceptionResponse)
      const message = this.resolveMessage(exceptionResponse, exception.message)
      const details = this.resolveDetails(exceptionResponse)

      return {
        status,
        body: {
          error: details === undefined ? { code, message } : { code, message, details },
        },
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'Internal server error' } },
    }
  }

  private resolveErrorCode(status: number, exceptionResponse: string | object): ErrorCode {
    const explicitCode = this.extractExplicitCode(exceptionResponse)
    if (explicitCode !== undefined) {
      return explicitCode
    }
    return STATUS_TO_ERROR_CODE[status] ?? ERROR_CODES.INTERNAL_ERROR
  }

  private extractExplicitCode(exceptionResponse: string | object): ErrorCode | undefined {
    if (!isRecord(exceptionResponse)) {
      return undefined
    }
    const codeValue = exceptionResponse.code
    if (typeof codeValue !== 'string') {
      return undefined
    }
    return isErrorCode(codeValue) ? codeValue : undefined
  }

  private resolveMessage(exceptionResponse: string | object, fallbackMessage: string): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse
    }
    if (!isRecord(exceptionResponse)) {
      return fallbackMessage
    }

    const messageValue = exceptionResponse.message
    if (typeof messageValue === 'string') {
      return messageValue
    }
    if (Array.isArray(messageValue)) {
      const stringMessages = messageValue.filter(
        (item): item is string => typeof item === 'string',
      )
      if (stringMessages.length > 0) {
        return stringMessages.join('; ')
      }
    }

    return fallbackMessage
  }

  private resolveDetails(exceptionResponse: string | object): unknown {
    if (!isRecord(exceptionResponse)) {
      return undefined
    }
    if ('details' in exceptionResponse) {
      return exceptionResponse.details
    }
    const messageValue = exceptionResponse.message
    if (Array.isArray(messageValue)) {
      return messageValue
    }
    return undefined
  }
}
