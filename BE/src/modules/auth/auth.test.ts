import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createTestApp } from '../../test/testApp.js'
import { resetStore } from '../../data/store.js'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns a token and the user for a known userId', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ userId: 'user-alice' })

    expect(response.status).toBe(200)
    expect(response.body.user).toEqual({ id: 'user-alice', displayName: 'Alice' })
    expect(typeof response.body.token).toBe('string')
  })

  it('returns 404 USER_NOT_FOUND for an unknown userId', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ userId: 'ghost' })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('USER_NOT_FOUND')
  })

  it('returns 400 VALIDATION_ERROR when userId is missing', async () => {
    const response = await request(createTestApp()).post('/api/auth/login').send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 VALIDATION_ERROR for a malformed JSON body', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ "userId": ')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
