import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ASSISTANT_REPLY_STRATEGY } from '../../agent/agent.tokens.js'
import { FakeAssistantStrategy } from '../../agent/fake-assistant.strategy.js'
import { OBJECT_STORAGE } from '../../object-storage/object-storage.tokens.js'
import { applyGlobalApiContract } from '../../../app-http-contract.js'
import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import type {
  CreateUploadUrlInput,
  ObjectStorage,
  StoredObject,
  UploadUrl,
} from '../../object-storage/types/object-storage.js'

const CDN_BASE_URL = 'https://cdn.test.local'

class FakeObjectStorage implements ObjectStorage {
  readonly objects = new Map<string, StoredObject>()

  createUploadUrl({ key }: CreateUploadUrlInput): Promise<UploadUrl> {
    return Promise.resolve({
      url: 'https://fake-storage.local',
      fields: { key },
      expiresInSeconds: 300,
    })
  }

  headObject(key: string): Promise<StoredObject | null> {
    return Promise.resolve(this.objects.get(key) ?? null)
  }

  deleteObjectQuietly(key: string): Promise<void> {
    this.objects.delete(key)
    return Promise.resolve()
  }
}

describe('Avatar API (e2e)', () => {
  let application: INestApplication<Server>
  let httpServer: Server
  let mongoServer: MongoMemoryServer
  const fakeStorage = new FakeObjectStorage()
  let token: string

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()
    process.env.AVATAR_CDN_BASE_URL = CDN_BASE_URL

    const { AppModule } = await import('../../../app.module.js')
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ASSISTANT_REPLY_STRATEGY)
      .useClass(FakeAssistantStrategy)
      .overrideProvider(OBJECT_STORAGE)
      .useValue(fakeStorage)
      .compile()

    application = moduleRef.createNestApplication()
    applyGlobalApiContract(application)
    await application.init()
    httpServer = application.getHttpServer()

    const signup = await request(httpServer).post('/api/auth/signup').send({
      email: 'avatar-user@example.com',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
    token = signup.body.token
    expect(signup.body.user.avatarUrl).toBeNull()
  })

  afterAll(async () => {
    await application.close()
    await mongoServer.stop()
    delete process.env.AVATAR_CDN_BASE_URL
  })

  it('rejects an unsupported content type when requesting an upload URL', async () => {
    const response = await request(httpServer)
      .post('/api/me/avatar/upload-url')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'image/gif' })

    expect(response.status).toBe(400)
  })

  it('rejects confirming an avatar that was never uploaded', async () => {
    const ticket = await request(httpServer)
      .post('/api/me/avatar/upload-url')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'image/png' })

    const response = await request(httpServer)
      .put('/api/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: ticket.body.key })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('AVATAR_NOT_UPLOADED')
  })

  it('rejects confirming a key owned by another user', async () => {
    const response = await request(httpServer)
      .put('/api/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'avatars/user-someone-else/photo.png' })

    expect(response.status).toBe(403)
  })

  it('completes the upload flow and exposes a CDN avatar URL', async () => {
    const ticket = await request(httpServer)
      .post('/api/me/avatar/upload-url')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'image/png' })

    const key = ticket.body.key as string
    fakeStorage.objects.set(key, { contentType: 'image/png', byteSize: 4096 })

    const setResponse = await request(httpServer)
      .put('/api/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ key })

    expect(setResponse.status).toBe(200)
    const avatarUrl = setResponse.body.avatarUrl as string
    expect(avatarUrl.startsWith(`${CDN_BASE_URL}/${key}?v=`)).toBe(true)

    const meResponse = await request(httpServer)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meResponse.body.avatarUrl).toBe(avatarUrl)
  })

  it('removes the avatar and deletes the stored object', async () => {
    const ticket = await request(httpServer)
      .post('/api/me/avatar/upload-url')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'image/webp' })

    const key = ticket.body.key as string
    fakeStorage.objects.set(key, { contentType: 'image/webp', byteSize: 2048 })
    await request(httpServer)
      .put('/api/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({ key })

    const removeResponse = await request(httpServer)
      .delete('/api/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(removeResponse.status).toBe(200)
    expect(removeResponse.body.avatarUrl).toBeNull()
    expect(fakeStorage.objects.has(key)).toBe(false)
  })

  it('requires authentication', async () => {
    const response = await request(httpServer)
      .post('/api/me/avatar/upload-url')
      .send({ contentType: 'image/png' })

    expect(response.status).toBe(401)
  })
})
