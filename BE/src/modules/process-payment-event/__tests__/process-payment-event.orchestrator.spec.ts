import { describe, expect, it, vi } from 'vitest'
import { ProcessPaymentEventOrchestrator } from '../process-payment-event.orchestrator.js'
import {
  PAYMENT_SESSION_COMPLETED_STATUS,
  PAYMENT_SESSION_FAILED_STATUS,
} from '../../payment-sessions/constants.js'
import {
  PAYMENT_FAILED_OUTCOME,
  PAYMENT_SUCCEEDED_OUTCOME,
} from '../../payment-provider/constants.js'
import type { PaymentSessionService } from '../../payment-sessions/payment-session.service.js'
import type { SubscriptionService } from '../../subscriptions/subscription.service.js'
import type { PaymentSession } from '../../payment-sessions/types/payment-session.js'

const PENDING_SESSION: PaymentSession = {
  id: 'pay-1',
  userId: 'user-1',
  planCode: 'pro',
  providerSessionId: 'provider-session-1',
  status: 'pending',
  processedEventIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildOrchestrator(overrides?: {
  session?: PaymentSession | null
  transition?: ReturnType<typeof vi.fn>
}): {
  orchestrator: ProcessPaymentEventOrchestrator
  transition: ReturnType<typeof vi.fn>
  activate: ReturnType<typeof vi.fn>
} {
  const findByProviderSessionId = vi
    .fn()
    .mockResolvedValue(overrides?.session === undefined ? PENDING_SESSION : overrides.session)
  const transition = overrides?.transition ?? vi.fn().mockResolvedValue(true)
  const paymentSessionService = {
    findByProviderSessionId,
    transition,
  } as unknown as PaymentSessionService

  const activate = vi.fn().mockResolvedValue(undefined)
  const subscriptionService = { activate } as unknown as SubscriptionService

  return {
    orchestrator: new ProcessPaymentEventOrchestrator(paymentSessionService, subscriptionService),
    transition,
    activate,
  }
}

describe('ProcessPaymentEventOrchestrator', () => {
  it('completes the session and activates the subscription on success', async () => {
    const { orchestrator, transition, activate } = buildOrchestrator()

    await orchestrator.process({
      id: 'evt-1',
      providerSessionId: 'provider-session-1',
      outcome: PAYMENT_SUCCEEDED_OUTCOME,
    })

    expect(transition).toHaveBeenCalledWith({
      id: 'pay-1',
      status: PAYMENT_SESSION_COMPLETED_STATUS,
      eventId: 'evt-1',
    })
    expect(activate).toHaveBeenCalledWith('user-1', 'pro')
  })

  it('is idempotent: a duplicate success event does not activate again', async () => {
    const { orchestrator, activate } = buildOrchestrator({
      transition: vi.fn().mockResolvedValue(false),
    })

    await orchestrator.process({
      id: 'evt-1',
      providerSessionId: 'provider-session-1',
      outcome: PAYMENT_SUCCEEDED_OUTCOME,
    })

    expect(activate).not.toHaveBeenCalled()
  })

  it('marks the session failed and never activates on a failed outcome', async () => {
    const { orchestrator, transition, activate } = buildOrchestrator()

    await orchestrator.process({
      id: 'evt-2',
      providerSessionId: 'provider-session-1',
      outcome: PAYMENT_FAILED_OUTCOME,
    })

    expect(transition).toHaveBeenCalledWith({
      id: 'pay-1',
      status: PAYMENT_SESSION_FAILED_STATUS,
      eventId: 'evt-2',
    })
    expect(activate).not.toHaveBeenCalled()
  })

  it('ignores an event for an unknown provider session', async () => {
    const { orchestrator, transition, activate } = buildOrchestrator({ session: null })

    await orchestrator.process({
      id: 'evt-3',
      providerSessionId: 'missing-session',
      outcome: PAYMENT_SUCCEEDED_OUTCOME,
    })

    expect(transition).not.toHaveBeenCalled()
    expect(activate).not.toHaveBeenCalled()
  })

  it('propagates a transient DB error so the consumer can redrive to the DLQ', async () => {
    const { orchestrator } = buildOrchestrator({
      transition: vi.fn().mockRejectedValue(new Error('mongo unavailable')),
    })

    await expect(
      orchestrator.process({
        id: 'evt-4',
        providerSessionId: 'provider-session-1',
        outcome: PAYMENT_SUCCEEDED_OUTCOME,
      }),
    ).rejects.toThrow('mongo unavailable')
  })
})
