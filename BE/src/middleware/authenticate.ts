import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../shared/ApiError.js'
import { resolveUserId } from '../modules/auth/auth.service.js'

const BEARER_PREFIX = 'Bearer '

function readBearerToken(req: Request): string | null {
  const header = req.header('authorization')
  if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
    return null
  }
  const token = header.slice(BEARER_PREFIX.length).trim()
  return token.length > 0 ? token : null
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = readBearerToken(req)
  const userId = token !== null ? resolveUserId(token) : null

  if (userId === null) {
    next(ApiError.unauthorized())
    return
  }

  req.userId = userId
  next()
}

export function getUserId(req: Request): string {
  const { userId } = req
  if (userId === undefined) {
    throw ApiError.unauthorized()
  }
  return userId
}
