import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ASSISTANT_REPLY_STRATEGY } from '../assistant/reply-strategy.port.js'
import { FakeAssistantStrategy } from '../assistant/fake-assistant.strategy.js'
import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import { applyGlobalApiContract } from '../app-http-contract.js'

const SEEDED_FOREIGN_CONVERSATION_ID = 'conv-alice-bob'

interface SseEvent {
  event: string
  data: unknown
}

// Parses a buffered text/event-stream body into its events.
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
    // Run the real Mongo DAOs against an ephemeral in-process MongoDB. MONGO_URI
    // must be set before AppModule is imported, because ConfigModule.forRoot
    // validates the environment at module-evaluation time — hence the dynamic import.
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()

    const { AppModule } = await import('../app.module.js')
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Keep e2e offline and deterministic: never call the real OpenAI API.
      .overrideProvider(ASSISTANT_REPLY_STRATEGY)
      .useClass(FakeAssistantStrategy)
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

      // The exchange is persisted: history shows the user message then the assistant reply.
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

      // Same reply replayed — not a second generated message.
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
        // DAO/DTO separation: Mongo internals never leak into the response.
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
        // Older messages are prepended so the running list stays oldest-first.
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
      // The most recently active conversation sorts to the front.
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
