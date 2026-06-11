import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import { applyGlobalApiContract } from '../app-http-contract.js'
import { AppModule } from '../app.module.js'

const SEEDED_FOREIGN_CONVERSATION_ID = 'conv-alice-bob'

describe('Chat API (e2e)', () => {
  let application: INestApplication<Server>
  let httpServer: Server

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    application = moduleRef.createNestApplication()
    applyGlobalApiContract(application)
    await application.init()
    httpServer = application.getHttpServer()
  })

  afterAll(async () => {
    await application.close()
  })

  describe('signup + login', () => {
    const credentials = { email: 'erin@example.com', password: 'password123', name: 'Erin' }

    it('signs up a new user (201) returning a token and a password-free user', async () => {
      const response = await request(httpServer).post('/api/auth/signup').send(credentials)

      expect(response.status).toBe(201)
      expect(typeof response.body.token).toBe('string')
      expect(response.body.user).toMatchObject({ email: credentials.email, displayName: 'Erin' })
      expect(response.body.user).not.toHaveProperty('passwordHash')
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('rejects a duplicate email with 409', async () => {
      const response = await request(httpServer).post('/api/auth/signup').send(credentials)

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED')
    })

    it('logs in with valid credentials (200)', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: credentials.email, password: credentials.password })

      expect(response.status).toBe(200)
      expect(typeof response.body.token).toBe('string')

      const meResponse = await request(httpServer)
        .get('/api/me')
        .set('Authorization', `Bearer ${response.body.token}`)
      expect(meResponse.status).toBe(200)
      expect(meResponse.body.email).toBe(credentials.email)
    })

    it('rejects invalid credentials with 401', async () => {
      const response = await request(httpServer)
        .post('/api/auth/login')
        .send({ email: credentials.email, password: 'wrong-password' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
    })

    it('rejects a malformed signup body with a structured 400', async () => {
      const response = await request(httpServer)
        .post('/api/auth/signup')
        .send({ email: 'not-an-email', password: 'x' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('JWT guard on chat endpoints', () => {
    it('returns 401 for /api/conversations without a token', async () => {
      const response = await request(httpServer).get('/api/conversations')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('returns the conversation list for an authenticated user', async () => {
      const token = await signUpAndGetToken(httpServer, 'frank@example.com', 'Frank')

      const response = await request(httpServer)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.conversations)).toBe(true)
    })
  })

  describe('participant authorization on conversation messages', () => {
    it("returns 403 for a conversation the user is not a participant in", async () => {
      const token = await signUpAndGetToken(httpServer, 'grace@example.com', 'Grace')

      const response = await request(httpServer)
        .get(`/api/conversations/${SEEDED_FOREIGN_CONVERSATION_ID}/messages`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 404 for a conversation that does not exist', async () => {
      const token = await signUpAndGetToken(httpServer, 'heidi@example.com', 'Heidi')

      const response = await request(httpServer)
        .get('/api/conversations/conv-does-not-exist/messages')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('CONVERSATION_NOT_FOUND')
    })
  })
})

async function signUpAndGetToken(
  httpServer: Server,
  email: string,
  name: string,
): Promise<string> {
  const response = await request(httpServer)
    .post('/api/auth/signup')
    .send({ email, password: 'password123', name })

  if (response.status !== 201 || typeof response.body.token !== 'string') {
    throw new Error(`Test setup failed: could not sign up ${email} (status ${response.status})`)
  }
  return response.body.token
}
