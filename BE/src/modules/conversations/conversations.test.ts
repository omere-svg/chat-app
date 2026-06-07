import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createTestApp, loginAs } from '../../test/testApp.js'
import { resetStore } from '../../data/store.js'

describe('conversations endpoints', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns 401 without a token', async () => {
    const response = await request(createTestApp()).get('/api/conversations')
    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('lists only the user\'s conversations, newest activity first', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    const ids = response.body.conversations.map((c: { id: string }) => c.id)
    expect(ids).toEqual(['conv-alice-bob', 'conv-alice-carol'])
    expect(ids).not.toContain('conv-bob-carol')
  })

  it('creates a new conversation (201) with the creator included', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: ['user-bob', 'user-carol'], title: 'Group chat' })

    expect(response.status).toBe(201)
    expect(response.body.conversation.participantIds).toEqual([
      'user-alice',
      'user-bob',
      'user-carol',
    ])
    expect(response.body.conversation.lastMessage).toBeNull()
  })

  it('returns 409 when a conversation with the same participants exists', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: ['user-bob'] })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('CONVERSATION_CONFLICT')
    expect(response.body.error.details.conversationId).toBe('conv-alice-bob')
  })

  it('returns 400 when a participant does not exist', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: ['ghost'] })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('supports posting and reading messages in a newly created conversation', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const created = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: ['user-bob', 'user-carol'], title: 'Group chat' })
    const conversationId = created.body.conversation.id as string

    const sent = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'first message' })
    expect(sent.status).toBe(201)

    const page = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`)

    expect(page.status).toBe(200)
    expect(page.body.messages).toHaveLength(1)
    expect(page.body.messages[0].body).toBe('first message')
  })

  it('re-sorts conversations by latest activity after a new message', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const before = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(before.body.conversations.map((c: { id: string }) => c.id)).toEqual([
      'conv-alice-bob',
      'conv-alice-carol',
    ])

    await request(app)
      .post('/api/conversations/conv-alice-carol/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'bump to top' })

    const after = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
    expect(after.body.conversations.map((c: { id: string }) => c.id)).toEqual([
      'conv-alice-carol',
      'conv-alice-bob',
    ])
    expect(after.body.conversations[0].lastMessage.body).toBe('bump to top')
  })
})
