import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createTestApp, loginAs } from '../../test/testApp.js'
import { resetStore } from '../../data/store.js'

const CONVERSATION_ID = 'conv-alice-bob'

describe('messages endpoints', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns the newest page with a cursor to older messages', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get(`/api/conversations/${CONVERSATION_ID}/messages?limit=2`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.messages).toHaveLength(2)
    expect(response.body.nextCursor).not.toBeNull()
  })

  it('paginates into older messages using the cursor', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const firstPage = await request(app)
      .get(`/api/conversations/${CONVERSATION_ID}/messages?limit=2`)
      .set('Authorization', `Bearer ${token}`)
    const cursor = firstPage.body.nextCursor as string

    const olderPage = await request(app)
      .get(`/api/conversations/${CONVERSATION_ID}/messages?limit=2&cursor=${cursor}`)
      .set('Authorization', `Bearer ${token}`)

    expect(olderPage.status).toBe(200)
    expect(olderPage.body.messages).toHaveLength(2)
    const firstIds = firstPage.body.messages.map((m: { id: string }) => m.id)
    const olderIds = olderPage.body.messages.map((m: { id: string }) => m.id)
    expect(olderIds).not.toEqual(firstIds)
  })

  it('returns 400 INVALID_CURSOR for an unknown cursor', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get(`/api/conversations/${CONVERSATION_ID}/messages?cursor=nope`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_CURSOR')
  })

  it('returns 400 VALIDATION_ERROR for a non-positive limit', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get(`/api/conversations/${CONVERSATION_ID}/messages?limit=0`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 403 when the user is not a participant', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get('/api/conversations/conv-bob-carol/messages')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 for an unknown conversation', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .get('/api/conversations/conv-missing/messages')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('CONVERSATION_NOT_FOUND')
  })

  it('creates a message (201) with a server-generated id', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post(`/api/conversations/${CONVERSATION_ID}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'hello', clientMessageId: 'client-1' })

    expect(response.status).toBe(201)
    expect(response.body.message.body).toBe('hello')
    expect(response.body.message.senderId).toBe('user-alice')
    expect(response.body.message.id).not.toBe('client-1')
    expect(response.body.message.id).toMatch(/^msg-/)
  })

  it('is idempotent: a repeated clientMessageId returns the original message', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const first = await request(app)
      .post(`/api/conversations/${CONVERSATION_ID}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'only once', clientMessageId: 'dedupe-key' })

    const second = await request(app)
      .post(`/api/conversations/${CONVERSATION_ID}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'only once', clientMessageId: 'dedupe-key' })

    expect(second.status).toBe(201)
    expect(second.body.message.id).toBe(first.body.message.id)
  })

  it('returns 400 VALIDATION_ERROR for a blank body', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post(`/api/conversations/${CONVERSATION_ID}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: '   ' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 500 SIMULATED_SEND_FAILURE when the simulate header is set', async () => {
    const app = createTestApp()
    const token = await loginAs(app, 'user-alice')

    const response = await request(app)
      .post(`/api/conversations/${CONVERSATION_ID}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Simulate-Failure', '1')
      .send({ body: 'boom' })

    expect(response.status).toBe(500)
    expect(response.body.error.code).toBe('SIMULATED_SEND_FAILURE')
  })
})
