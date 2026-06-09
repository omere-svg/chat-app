import { Router } from 'express'
import * as authController from './auth.controller.js'

export const authRouter: Router = Router()

authRouter.post('/login', authController.login)
