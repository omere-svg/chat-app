import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PAYMENT_SESSION_PENDING_STATUS } from './constants.js'
import { PAYMENT_SESSION_REPOSITORY } from './payment-session.repository.js'
import type { PaymentSessionRepository } from './payment-session.repository.js'
import type { CreatePaymentSessionInput } from './types/create-payment-session-input.js'
import type { PaymentSession } from './types/payment-session.js'
import type { TransitionPaymentSessionInput } from './types/transition-payment-session-input.js'

@Injectable()
export class PaymentSessionService {
  constructor(
    @Inject(PAYMENT_SESSION_REPOSITORY)
    private readonly paymentSessionRepository: PaymentSessionRepository,
  ) {}

  async create({ userId, planCode, providerSessionId }: CreatePaymentSessionInput): Promise<PaymentSession> {
    const now = new Date()
    const session: PaymentSession = {
      id: `pay-${randomUUID()}`,
      userId,
      planCode,
      providerSessionId,
      status: PAYMENT_SESSION_PENDING_STATUS,
      processedEventIds: [],
      createdAt: now,
      updatedAt: now,
    }
    await this.paymentSessionRepository.insert(session)
    return session
  }

  async findByProviderSessionId(providerSessionId: string): Promise<PaymentSession | null> {
    return this.paymentSessionRepository.findByProviderSessionId(providerSessionId)
  }

  async transition(input: TransitionPaymentSessionInput): Promise<boolean> {
    return this.paymentSessionRepository.transition(input)
  }
}
