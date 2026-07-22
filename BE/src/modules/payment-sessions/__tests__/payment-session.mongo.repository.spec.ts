import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MongoPaymentSessionRepository } from '../payment-session.mongo.repository.js'
import { PaymentSessionDocument, PaymentSessionSchema } from '../payment-session.schema.js'
import {
  PAYMENT_SESSION_COMPLETED_STATUS,
  PAYMENT_SESSION_FAILED_STATUS,
  PAYMENT_SESSION_PENDING_STATUS,
} from '../constants.js'
import type { Connection, Model } from 'mongoose'
import type { PaymentSession } from '../types/payment-session.js'

describe('MongoPaymentSessionRepository', () => {
  let mongoServer: MongoMemoryServer
  let connection: Connection
  let sessionModel: Model<PaymentSessionDocument>
  let repository: MongoPaymentSessionRepository

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    connection = await mongoose.createConnection(mongoServer.getUri()).asPromise()
    sessionModel = connection.model(PaymentSessionDocument.name, PaymentSessionSchema)
    await sessionModel.init()
    repository = new MongoPaymentSessionRepository(sessionModel)
  })

  beforeEach(async () => {
    await sessionModel.deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
    await mongoServer.stop()
  })

  it('finds a session by its provider session id', async () => {
    await insertPending('pay-1', 'provider-1')

    const found = await repository.findByProviderSessionId('provider-1')

    expect(found?.id).toBe('pay-1')
    expect(found?.status).toBe(PAYMENT_SESSION_PENDING_STATUS)
  })

  it('transitions a pending session exactly once and records the event id', async () => {
    await insertPending('pay-1', 'provider-1')

    const transitioned = await repository.transition({
      id: 'pay-1',
      status: PAYMENT_SESSION_COMPLETED_STATUS,
      eventId: 'evt-1',
    })

    expect(transitioned).toBe(true)
    const found = await repository.findByProviderSessionId('provider-1')
    expect(found?.status).toBe(PAYMENT_SESSION_COMPLETED_STATUS)
    expect(found?.processedEventIds).toEqual(['evt-1'])
  })

  it('is idempotent: a second transition on a terminal session is a no-op', async () => {
    await insertPending('pay-1', 'provider-1')
    await repository.transition({
      id: 'pay-1',
      status: PAYMENT_SESSION_COMPLETED_STATUS,
      eventId: 'evt-1',
    })

    const second = await repository.transition({
      id: 'pay-1',
      status: PAYMENT_SESSION_FAILED_STATUS,
      eventId: 'evt-2',
    })

    expect(second).toBe(false)
    const found = await repository.findByProviderSessionId('provider-1')
    expect(found?.status).toBe(PAYMENT_SESSION_COMPLETED_STATUS)
    expect(found?.processedEventIds).toEqual(['evt-1'])
  })

  async function insertPending(id: string, providerSessionId: string): Promise<void> {
    const now = new Date()
    const session: PaymentSession = {
      id,
      userId: 'user-1',
      planCode: 'pro',
      providerSessionId,
      status: PAYMENT_SESSION_PENDING_STATUS,
      processedEventIds: [],
      createdAt: now,
      updatedAt: now,
    }
    await repository.insert(session)
  }
})
