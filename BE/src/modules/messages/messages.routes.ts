import { Router } from 'express'
import * as messagesController from './messages.controller.js'

export const messagesRouter: Router = Router({ mergeParams: true })

messagesRouter.get('/', messagesController.list)
messagesRouter.post('/', messagesController.create)
