import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { messagesRouter } from '../messages/messages.routes.js'
import * as conversationsController from './conversations.controller.js'

export const conversationsRouter: Router = Router()

conversationsRouter.use(authenticate)

conversationsRouter.get('/', conversationsController.list)
conversationsRouter.post('/', conversationsController.create)
conversationsRouter.use('/:conversationId/messages', messagesRouter)
