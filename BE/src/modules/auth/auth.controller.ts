import type { Request, Response } from 'express'
import { parseRequest } from '../../shared/validation.js'
import { loginRequestSchema } from './auth.schemas.js'
import * as authService from './auth.service.js'

export function login(req: Request, res: Response): void {
  const { userId } = parseRequest(loginRequestSchema, req.body)
  const result = authService.login(userId)
  res.status(200).json(result)
}
