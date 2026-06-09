import request from 'supertest'
import type { Express } from 'express'
import { createApp } from '../app.js'
import type { AppConfig } from '../config/env.js'

const TEST_CONFIG: AppConfig = {
  port: 0,
  frontendOrigin: 'http://localhost:5173',
}

export function createTestApp(): Express {
  return createApp(TEST_CONFIG)
}

export async function loginAs(app: Express, userId: string): Promise<string> {
  const response = await request(app).post('/api/auth/login').send({ userId })
  const body = response.body as { token: string }
  return body.token
}
