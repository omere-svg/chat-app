import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../shared/ApiError.js'
import { ERROR_CODES } from '../shared/errorCodes.js'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(
    new ApiError(
      404,
      ERROR_CODES.ROUTE_NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`,
    ),
  )
}
