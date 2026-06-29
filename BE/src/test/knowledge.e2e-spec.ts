import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ASSISTANT_REPLY_STRATEGY } from '../assistant/reply-strategy.port.js'
import { FakeAssistantStrategy } from '../assistant/fake-assistant.strategy.js'
import { EMBEDDINGS_PROVIDER } from '../knowledge/ingestion/embeddings.port.js'
import { applyGlobalApiContract } from '../app-http-contract.js'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'

// Deterministic embeddings so the e2e never calls OpenAI. Dimensionality is irrelevant
// here — mongodb-memory-server stores the vectors but cannot run $vectorSearch, so the
// upload/list/delete paths (which never query by vector) are fully exercisable.
class FakeEmbeddingsProvider implements EmbeddingsProvider {
  embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map(() => [0.1, 0.2, 0.3]))
  }
  embedQuery(): Promise<number[]> {
    return Promise.resolve([0.1, 0.2, 0.3])
  }
}

async function signUpAndGetToken(httpServer: Server, email: string): Promise<string> {
  const response = await request(httpServer)
    .post('/api/auth/signup')
    .send({ email, password: 'password123', name: email.split('@')[0] })
  if (response.status !== 201 || typeof response.body.token !== 'string') {
    throw new Error(`Test setup failed: could not sign up ${email} (status ${response.status})`)
  }
  return response.body.token
}

describe('Knowledge base (e2e)', () => {
  let application: INestApplication<Server>
  let httpServer: Server
  let mongoServer: MongoMemoryServer
  let tokenA: string
  let tokenB: string

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()

    const { AppModule } = await import('../app.module.js')
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ASSISTANT_REPLY_STRATEGY)
      .useClass(FakeAssistantStrategy)
      .overrideProvider(EMBEDDINGS_PROVIDER)
      .useClass(FakeEmbeddingsProvider)
      .compile()

    application = moduleRef.createNestApplication()
    applyGlobalApiContract(application)
    await application.init()
    httpServer = application.getHttpServer()

    tokenA = await signUpAndGetToken(httpServer, 'kb-alice@example.com')
    tokenB = await signUpAndGetToken(httpServer, 'kb-bob@example.com')
  })

  afterAll(async () => {
    await application.close()
    await mongoServer.stop()
  })

  it('rejects an unauthenticated upload with 401', async () => {
    const response = await request(httpServer)
      .post('/api/knowledge/documents')
      .attach('file', Buffer.from('hello'), 'notes.txt')
    expect(response.status).toBe(401)
  })

  it('ingests a document and reports ready status with a chunk count', async () => {
    const response = await request(httpServer)
      .post('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', Buffer.from('Venus is the hottest planet.'), 'space.md')

    expect(response.status).toBe(201)
    expect(response.body.document).toMatchObject({ filename: 'space.md', status: 'ready' })
    expect(response.body.document.chunkCount).toBeGreaterThan(0)
    // Internal fields never leak to the client.
    expect(response.body.document).not.toHaveProperty('userId')
    expect(response.body.document).not.toHaveProperty('contentHash')
  })

  it('is idempotent: re-uploading identical content makes no duplicate', async () => {
    const upload = (): request.Test =>
      request(httpServer)
        .post('/api/knowledge/documents')
        .set('Authorization', `Bearer ${tokenA}`)
        .attach('file', Buffer.from('Mars has two moons.'), 'mars.txt')

    const first = await upload()
    const second = await upload()

    expect(first.status).toBe(201)
    expect(second.body.document.id).toBe(first.body.document.id)

    const list = await request(httpServer)
      .get('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
    const marsDocs = list.body.documents.filter(
      (document: { filename: string }) => document.filename === 'mars.txt',
    )
    expect(marsDocs).toHaveLength(1)
  })

  it("does not expose another user's documents (cross-user isolation)", async () => {
    const listB = await request(httpServer)
      .get('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenB}`)
    expect(listB.status).toBe(200)
    expect(listB.body.documents).toEqual([])
  })

  it("404s when a user tries to delete a document they do not own", async () => {
    const listA = await request(httpServer)
      .get('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
    const someDocumentId = listA.body.documents[0].id

    const response = await request(httpServer)
      .delete(`/api/knowledge/documents/${someDocumentId}`)
      .set('Authorization', `Bearer ${tokenB}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('KNOWLEDGE_DOCUMENT_NOT_FOUND')

    // The owner can still see it — B's failed delete changed nothing.
    const stillThere = await request(httpServer)
      .get('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(stillThere.body.documents.some((d: { id: string }) => d.id === someDocumentId)).toBe(true)
  })

  it('rejects an unsupported file type with 400 UNSUPPORTED_DOCUMENT', async () => {
    const response = await request(httpServer)
      .post('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', Buffer.from('binary'), 'image.png')
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('UNSUPPORTED_DOCUMENT')
  })

  it('rejects an empty document with 400 VALIDATION_ERROR', async () => {
    const response = await request(httpServer)
      .post('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', Buffer.from('   '), 'blank.txt')
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects an oversized upload with a structured client error (no document created)', async () => {
    const response = await request(httpServer)
      .post('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', Buffer.alloc(1_000_001, 'a'), 'big.txt')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('deletes a document and its chunks, scoped to the owner', async () => {
    const created = await request(httpServer)
      .post('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
      .attach('file', Buffer.from('Temporary doc to delete.'), 'temp.txt')
    const documentId = created.body.document.id

    const deleteResponse = await request(httpServer)
      .delete(`/api/knowledge/documents/${documentId}`)
      .set('Authorization', `Bearer ${tokenA}`)
    expect(deleteResponse.status).toBe(204)

    const list = await request(httpServer)
      .get('/api/knowledge/documents')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(list.body.documents.some((d: { id: string }) => d.id === documentId)).toBe(false)
  })

  it('creates a tutor conversation owned solely by the creator', async () => {
    const response = await request(httpServer)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ type: 'tutor' })
    expect(response.status).toBe(201)
    expect(response.body.conversation.type).toBe('tutor')
    expect(response.body.conversation.title).toBe('AI Tutor')
    expect(response.body.conversation.participantIds).toHaveLength(1)
  })
})
