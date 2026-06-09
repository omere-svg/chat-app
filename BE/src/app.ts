import express from 'express'
import cors from 'cors'
import type { Express } from 'express'
import type { AppConfig } from './config/env.js'
import { requestLogger } from './middleware/requestLogger.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { conversationsRouter } from './modules/conversations/conversations.routes.js'

export function createApp(config: AppConfig): Express {
  const app = express()

  app.use(cors({ origin: config.frontendOrigin }))
  app.use(express.json())
  app.use(requestLogger)

  app.use('/api/auth', authRouter)
  app.use('/api/conversations', conversationsRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
