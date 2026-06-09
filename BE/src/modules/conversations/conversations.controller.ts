import type { Request, Response } from 'express'
import { getUserId } from '../../middleware/authenticate.js'
import { parseRequest } from '../../shared/validation.js'
import { createConversationSchema } from './conversations.schemas.js'
import * as conversationsService from './conversations.service.js'

export function list(req: Request, res: Response): void {
  const userId = getUserId(req)
  const conversations = conversationsService.listForUser(userId)
  res.status(200).json({ conversations })
}

export function create(req: Request, res: Response): void {
  const userId = getUserId(req)
  const input = parseRequest(createConversationSchema, req.body)
  const conversation = conversationsService.create(userId, input)
  res.status(201).json({ conversation })
}
