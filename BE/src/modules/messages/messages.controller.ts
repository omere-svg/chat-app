import type { Request, Response } from 'express'
import { getUserId } from '../../middleware/authenticate.js'
import { parseRequest } from '../../shared/validation.js'
import { ApiError } from '../../shared/ApiError.js'
import { listMessagesQuerySchema, sendMessageSchema } from './messages.schemas.js'
import * as messagesService from './messages.service.js'

function getConversationId(req: Request): string {
  const raw = req.params.conversationId
  const conversationId = Array.isArray(raw) ? raw[0] : raw
  if (conversationId === undefined || conversationId.length === 0) {
    throw ApiError.conversationNotFound()
  }
  return conversationId
}

export function list(req: Request, res: Response): void {
  const userId = getUserId(req)
  const conversationId = getConversationId(req)
  const query = parseRequest(listMessagesQuerySchema, req.query)
  const page = messagesService.listMessages(userId, conversationId, query)
  res.status(200).json(page)
}

export function create(req: Request, res: Response): void {
  if (req.header('X-Simulate-Failure') === '1') {
    throw ApiError.simulatedSendFailure()
  }

  const userId = getUserId(req)
  const conversationId = getConversationId(req)
  const input = parseRequest(sendMessageSchema, req.body)
  const message = messagesService.createMessage(userId, conversationId, input)
  res.status(201).json({ message })
}
