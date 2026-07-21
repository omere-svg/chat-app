import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ASSISTANT_REPLY_STRATEGY } from '../modules/agent/agent.tokens.js'
import { FakeAssistantStrategy } from '../modules/agent/fake-assistant.strategy.js'
import { EMAIL_SENDER } from '../modules/email-sender/email-sender.tokens.js'
import type { EmailMessage } from '../modules/email-sender/types/email-message.js'
import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import { applyGlobalApiContract } from '../app-http-contract.js'

const SEEDED_FOREIGN_CONVERSATION_ID = 'conv-alice-bob'

const sentEmails: EmailMessage[] = []
const fakeEmailSender = {
  send: (message: EmailMessage): Promise<void> => {
    sentEmails.push(message)
    return Promise.resolve()
  },
}

function extractConfirmationToken(recipient: string): string {
  const message = [...sentEmails].reverse().find((email) => email.to === recipient)
  const token = message?.textBody.match(/token=([^\s]+)/)?.[1]
  if (token === undefined) {
    throw new Error(`No confirmation token was sent to ${recipient}`)
  }
  return token
}

interface SseEvent {
  event: string
  data: unknown
}

function parseSseEvents(body: string): SseEvent[] {
  return body
    .split('\n\n')
    .filter((frame) => frame.trim().length > 0)
    .map((frame) => {
      const lines = frame.split('\n')
      const event = lines.find((line) => line.startsWith('event: '))?.slice('event: '.length) ?? ''
      const data = lines.find((line) => line.startsWith('data: '))?.slice('data: '.length) ?? 'null'
      return { event, data: JSON.parse(data) as unknown }
    })
}

describe('Chat API (e2e)', () => {
  let application: INestApplication<Server>
  let httpServer: Server
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()

    const { AppModule } = await import('../app.module.js')
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ASSISTANT_REPLY_STRATEGY)
      .useClass(FakeAssistantStrategy)
      .overrideProvider(EMAIL_SENDER)
      .useValue(fakeEmailSender)
      .compile()

    application = moduleRef.createNestApplication()
    applyGlobalApiContract(application)
    await application.init()
    httpServer = application.getHttpServer()
  })

  afterAll(async () => {
    await application.close()
    await mongoServer.stop()
  })

  describe('signup + login', () => {
    const credentials = {
      email: 'erin@example.com',
      password: 'password123',
      firstName: 'Erin',
      lastName: 'Example',
    }

    it('signs up a new user (201) returning a token and a password-free user', async () => {
      const response = await request(httpServer).post('/api/auth/signup').send(credentials)

      expect(response.status).toBe(201)
      expect(typeof response.body.token).toBe('string')
      expect(response.body.user).toMatchObject({
        email: credentials.email,
        firstName: 'Erin',
        lastName: 'Example',
      })
      expect(response.body.user).not.toHaveProperty('passwordHash')
      expect(response.body.user).not.toHaveProperty('password')
      expect(response.body.user).not.toHaveProperty('previousEmails')
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
      expect(meResponse.body).not.toHaveProperty('previousEmails')
      expect(response.body.user).not.toHaveProperty('previousEmails')
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

  describe('profile updates', () => {
    it('updates the first and last name via PATCH /api/me/profile', async () => {
      const token = await signUpAndGetToken(httpServer, 'nora@example.com', 'Nora')

      const response = await request(httpServer)
        .patch('/api/me/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Nora', lastName: 'Newman' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({ firstName: 'Nora', lastName: 'Newman' })
    })

    it('requires authentication (401)', async () => {
      const response = await request(httpServer)
        .patch('/api/me/profile')
        .send({ firstName: 'No', lastName: 'Auth' })

      expect(response.status).toBe(401)
    })

    it('reflects a renamed participant in existing direct conversation titles', async () => {
      const token = await signUpAndGetToken(httpServer, 'rex@example.com', 'Rex')

      const createResponse = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['bob@example.com'] })
      expect(createResponse.status).toBe(201)
      expect(createResponse.body.conversation.title).toContain('Rex')
      const conversationId = createResponse.body.conversation.id

      await request(httpServer)
        .patch('/api/me/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Maximus', lastName: 'Renamed' })

      const listResponse = await request(httpServer)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
      const conversation = listResponse.body.conversations.find(
        (candidate: { id: string }) => candidate.id === conversationId,
      )
      expect(conversation.title).toContain('Maximus')
      expect(conversation.title).not.toContain('Rex')
    })
  })

  describe('email change (confirmation flow)', () => {
    it('requests, confirms, swaps the email and records the previous one', async () => {
      const token = await signUpAndGetToken(httpServer, 'oscar@example.com', 'Oscar')

      const requestResponse = await request(httpServer)
        .post('/api/me/email-change/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ newEmail: 'oscar.new@example.com' })
      expect(requestResponse.status).toBe(202)
      expect(requestResponse.body.status).toBe('confirmation_sent')

      const confirmationToken = extractConfirmationToken('oscar.new@example.com')
      const confirmResponse = await request(httpServer)
        .post('/api/email-change/confirm')
        .send({ token: confirmationToken })
      expect(confirmResponse.status).toBe(200)
      expect(confirmResponse.body.email).toBe('oscar.new@example.com')

      const meResponse = await request(httpServer)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
      expect(meResponse.body.email).toBe('oscar.new@example.com')

      const previousResponse = await request(httpServer)
        .get('/api/me/previous-emails')
        .set('Authorization', `Bearer ${token}`)
      expect(previousResponse.status).toBe(200)
      expect(previousResponse.body.previousEmails).toEqual(['oscar@example.com'])
    })

    it('is an idempotent no-op when the same token is confirmed twice', async () => {
      const token = await signUpAndGetToken(httpServer, 'replay@example.com', 'Replay')

      await request(httpServer)
        .post('/api/me/email-change/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ newEmail: 'replay.new@example.com' })
      const confirmationToken = extractConfirmationToken('replay.new@example.com')

      const first = await request(httpServer)
        .post('/api/email-change/confirm')
        .send({ token: confirmationToken })
      const second = await request(httpServer)
        .post('/api/email-change/confirm')
        .send({ token: confirmationToken })

      expect(first.status).toBe(200)
      expect(second.status).toBe(200)
      expect(second.body.email).toBe('replay.new@example.com')

      const previousResponse = await request(httpServer)
        .get('/api/me/previous-emails')
        .set('Authorization', `Bearer ${token}`)
      expect(previousResponse.body.previousEmails).toEqual(['replay@example.com'])
    })

    it('returns the changed email to both concurrent confirmations and records history once', async () => {
      const token = await signUpAndGetToken(httpServer, 'concurrent@example.com', 'Concurrent')

      await request(httpServer)
        .post('/api/me/email-change/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ newEmail: 'concurrent.new@example.com' })
      const confirmationToken = extractConfirmationToken('concurrent.new@example.com')

      const [first, second] = await Promise.all([
        request(httpServer).post('/api/email-change/confirm').send({ token: confirmationToken }),
        request(httpServer).post('/api/email-change/confirm').send({ token: confirmationToken }),
      ])

      expect(first.status).toBe(200)
      expect(first.body.email).toBe('concurrent.new@example.com')
      expect(second.status).toBe(200)
      expect(second.body.email).toBe('concurrent.new@example.com')

      const previousResponse = await request(httpServer)
        .get('/api/me/previous-emails')
        .set('Authorization', `Bearer ${token}`)
      expect(previousResponse.body.previousEmails).toEqual(['concurrent@example.com'])
    })

    it('rejects requesting the current email (400)', async () => {
      const token = await signUpAndGetToken(httpServer, 'pat@example.com', 'Pat')

      const response = await request(httpServer)
        .post('/api/me/email-change/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ newEmail: 'pat@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects requesting an already-registered email (409)', async () => {
      const token = await signUpAndGetToken(httpServer, 'quincy@example.com', 'Quincy')

      const response = await request(httpServer)
        .post('/api/me/email-change/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ newEmail: 'bob@example.com' })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED')
    })

    it('requires authentication to request a change (401)', async () => {
      const response = await request(httpServer)
        .post('/api/me/email-change/request')
        .send({ newEmail: 'someone@example.com' })

      expect(response.status).toBe(401)
    })

    it('rejects confirming an invalid token (400)', async () => {
      const response = await request(httpServer)
        .post('/api/email-change/confirm')
        .send({ token: 'not-a-real-token' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('EMAIL_CHANGE_TOKEN_INVALID')
    })

    it.each([{}, { token: '' }, { token: 123 }])(
      'maps malformed confirmation token bodies to the token domain error',
      async (body) => {
        const response = await request(httpServer).post('/api/email-change/confirm').send(body)

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('EMAIL_CHANGE_TOKEN_INVALID')
      },
    )

    it('requires authentication to read previous emails (401)', async () => {
      const response = await request(httpServer).get('/api/me/previous-emails')

      expect(response.status).toBe(401)
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

  describe('creating conversations', () => {
    it('creates a conversation with an existing participant (201)', async () => {
      const token = await signUpAndGetToken(httpServer, 'ivan@example.com', 'Ivan')

      const response = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['bob@example.com'] })

      expect(response.status).toBe(201)
      expect(typeof response.body.conversation.id).toBe('string')
      expect(response.body.conversation.participantIds).toContain('user-bob')
      expect(response.body.conversation.title).toContain('Bob')
    })

    it('rejects an unknown participant email with 400', async () => {
      const token = await signUpAndGetToken(httpServer, 'judy@example.com', 'Judy')

      const response = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['nobody@example.com'] })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('USER_NOT_FOUND')
      expect(response.body.error.details.unknownEmails).toEqual(['nobody@example.com'])
    })

    it('rejects a duplicate participant set with 409', async () => {
      const token = await signUpAndGetToken(httpServer, 'mallory@example.com', 'Mallory')

      const firstResponse = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['carol@example.com'] })
      expect(firstResponse.status).toBe(201)

      const duplicateResponse = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['carol@example.com'] })

      expect(duplicateResponse.status).toBe(409)
      expect(duplicateResponse.body.error.code).toBe('CONVERSATION_CONFLICT')
    })
  })

  describe('assistant conversations', () => {
    it('creates an assistant conversation with the creator as sole participant (201)', async () => {
      const token = await signUpAndGetToken(httpServer, 'rita@example.com', 'Rita')

      const response = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'assistant' })

      expect(response.status).toBe(201)
      expect(response.body.conversation.type).toBe('assistant')
      expect(response.body.conversation.title).toBe('AI Assistant')
      expect(response.body.conversation.participantIds).toHaveLength(1)
    })

    it('allows multiple assistant conversations for the same user (no 409)', async () => {
      const token = await signUpAndGetToken(httpServer, 'sam@example.com', 'Sam')

      const first = await createAssistantConversation(httpServer, token)
      const second = await createAssistantConversation(httpServer, token)

      expect(second).not.toBe(first)
    })

    it('streams user_message -> tokens -> done and persists the assistant reply', async () => {
      const token = await signUpAndGetToken(httpServer, 'tara@example.com', 'Tara')
      const conversationId = await createAssistantConversation(httpServer, token)

      const streamResponse = await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'hello there', clientMessageId: 'client-1' })

      expect(streamResponse.status).toBe(200)
      expect(streamResponse.headers['content-type']).toContain('text/event-stream')

      const events = parseSseEvents(streamResponse.text)
      const eventNames = events.map((event) => event.event)
      expect(eventNames[0]).toBe('user_message')
      expect(eventNames).toContain('token')
      expect(eventNames.at(-1)).toBe('done')

      const doneEvent = events.at(-1)?.data as { message: { senderId: string; body: string } }
      expect(doneEvent.message.senderId).toBe('assistant')
      expect(doneEvent.message.body).toContain('Echo: hello there')

      const historyResponse = await request(httpServer)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
      expect(historyResponse.status).toBe(200)
      const bodies = historyResponse.body.messages.map((message: { body: string }) => message.body)
      expect(bodies).toContain('hello there')
      expect(bodies.some((body: string) => body.startsWith('Echo:'))).toBe(true)
    })

    it('names the conversation after its first user message', async () => {
      const token = await signUpAndGetToken(httpServer, 'vince@example.com', 'Vince')
      const conversationId = await createAssistantConversation(httpServer, token)

      await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Plan a trip to Japan', clientMessageId: 'client-title' })

      const listResponse = await request(httpServer)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
      const conversation = listResponse.body.conversations.find(
        (candidate: { id: string }) => candidate.id === conversationId,
      )
      expect(conversation.title).toBe('Plan a trip to Japan')
    })

    it('keeps the derived title and does not rename on later messages', async () => {
      const token = await signUpAndGetToken(httpServer, 'wendy@example.com', 'Wendy')
      const conversationId = await createAssistantConversation(httpServer, token)

      await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'First message wins the title', clientMessageId: 'client-first' })

      await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'A later message must not rename it', clientMessageId: 'client-second' })

      const listResponse = await request(httpServer)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
      const conversation = listResponse.body.conversations.find(
        (candidate: { id: string }) => candidate.id === conversationId,
      )
      expect(conversation.title).toBe('First message wins the title')
    })

    it('replays the same reply for a duplicate clientMessageId without a second exchange', async () => {
      const token = await signUpAndGetToken(httpServer, 'uma@example.com', 'Uma')
      const conversationId = await createAssistantConversation(httpServer, token)

      const send = (): request.Test =>
        request(httpServer)
          .post(`/api/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send({ body: 'remember me', clientMessageId: 'client-dup' })

      const firstDone = parseSseEvents((await send()).text).at(-1)?.data as {
        message: { id: string }
      }
      const secondDone = parseSseEvents((await send()).text).at(-1)?.data as {
        message: { id: string }
      }

      expect(secondDone.message.id).toBe(firstDone.message.id)

      const historyResponse = await request(httpServer)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
      const assistantReplies = historyResponse.body.messages.filter(
        (message: { senderId: string }) => message.senderId === 'assistant',
      )
      expect(assistantReplies).toHaveLength(1)
    })
  })

  describe('simulated send failure (dev hook)', () => {
    it('returns 500 when the header is set in a non-production environment', async () => {
      const token = await signUpAndGetToken(httpServer, 'niaj@example.com', 'Niaj')
      const createResponse = await request(httpServer)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ participantEmails: ['bob@example.com'] })
      const conversationId = createResponse.body.conversation.id

      const response = await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-simulate-failure', '1')
        .send({ body: 'hello' })

      expect(response.status).toBe(500)
      expect(response.body.error.code).toBe('SIMULATED_SEND_FAILURE')
    })
  })

  describe('cursor-paginated message history and persistence', () => {
    it('pages through a 100+ message thread oldest-first with no gaps or duplicates', async () => {
      const token = await signUpAndGetToken(httpServer, 'olga@example.com', 'Olga')
      const conversationId = await createConversationWith(httpServer, token, 'bob@example.com')

      const totalMessages = 105
      for (let index = 1; index <= totalMessages; index++) {
        const sendResponse = await request(httpServer)
          .post(`/api/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${token}`)
          .send({ body: `message ${index.toString()}` })
        expect(sendResponse.status).toBe(201)
        expect(sendResponse.body.message).toHaveProperty('id')
        expect(sendResponse.body.message).not.toHaveProperty('_id')
        expect(sendResponse.body.message).not.toHaveProperty('__v')
      }

      const collectedIds: string[] = []
      let cursor: string | null = null
      let pageCount = 0
      do {
        const query: Record<string, string> = { limit: '50' }
        if (cursor !== null) {
          query.cursor = cursor
        }
        const pageResponse = await request(httpServer)
          .get(`/api/conversations/${conversationId}/messages`)
          .query(query)
          .set('Authorization', `Bearer ${token}`)
        expect(pageResponse.status).toBe(200)

        const pageIds = pageResponse.body.messages.map((message: { id: string }) => message.id)
        collectedIds.unshift(...pageIds)
        cursor = pageResponse.body.nextCursor
        pageCount += 1
      } while (cursor !== null && pageCount < 10)

      expect(cursor).toBeNull()
      expect(collectedIds).toHaveLength(totalMessages)
      expect(new Set(collectedIds).size).toBe(totalMessages)
    })

    it('rejects an unknown pagination cursor with 400', async () => {
      const token = await signUpAndGetToken(httpServer, 'peggy@example.com', 'Peggy')
      const conversationId = await createConversationWith(httpServer, token, 'bob@example.com')

      const response = await request(httpServer)
        .get(`/api/conversations/${conversationId}/messages`)
        .query({ cursor: 'msg-does-not-exist' })
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('INVALID_CURSOR')
    })

    it("surfaces a sent message as the conversation's latest activity", async () => {
      const token = await signUpAndGetToken(httpServer, 'quinn@example.com', 'Quinn')
      const conversationId = await createConversationWith(httpServer, token, 'carol@example.com')

      await request(httpServer)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'latest activity wins' })

      const listResponse = await request(httpServer)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`)
      expect(listResponse.status).toBe(200)

      const preview = listResponse.body.conversations.find(
        (conversation: { id: string }) => conversation.id === conversationId,
      )
      expect(preview.lastMessage.body).toBe('latest activity wins')
      expect(preview.updatedAt).toBe(preview.lastMessage.createdAt)
      expect(listResponse.body.conversations[0].id).toBe(conversationId)
    })
  })
})

async function createConversationWith(
  httpServer: Server,
  token: string,
  participantEmail: string,
): Promise<string> {
  const response = await request(httpServer)
    .post('/api/conversations')
    .set('Authorization', `Bearer ${token}`)
    .send({ participantEmails: [participantEmail] })

  if (response.status !== 201 || typeof response.body.conversation?.id !== 'string') {
    throw new Error(`Test setup failed: could not create conversation (status ${response.status})`)
  }
  return response.body.conversation.id
}

async function createAssistantConversation(httpServer: Server, token: string): Promise<string> {
  const response = await request(httpServer)
    .post('/api/conversations')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'assistant' })

  if (response.status !== 201 || typeof response.body.conversation?.id !== 'string') {
    throw new Error(
      `Test setup failed: could not create assistant conversation (status ${response.status})`,
    )
  }
  return response.body.conversation.id
}

async function signUpAndGetToken(
  httpServer: Server,
  email: string,
  firstName: string,
): Promise<string> {
  const response = await request(httpServer)
    .post('/api/auth/signup')
    .send({ email, password: 'password123', firstName, lastName: 'Tester' })

  if (response.status !== 201 || typeof response.body.token !== 'string') {
    throw new Error(`Test setup failed: could not sign up ${email} (status ${response.status})`)
  }
  return response.body.token
}
