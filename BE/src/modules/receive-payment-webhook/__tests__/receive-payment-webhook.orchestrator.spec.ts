import { describe, expect, it, vi } from 'vitest'
import { ReceivePaymentWebhookOrchestrator } from '../receive-payment-webhook.orchestrator.js'
import { WebhookSignatureInvalidError } from '../errors/webhook-signature-invalid.error.js'
import { WEBHOOK_ACCEPTED_STATUS, WEBHOOK_IGNORED_STATUS } from '../constants.js'
import { PAYMENT_SUCCEEDED_OUTCOME } from '../../payment-provider/constants.js'
import type { PaymentProvider } from '../../payment-provider/types/payment-provider.js'
import type { PaymentEventQueue } from '../../payment-event-queue/types/payment-event-queue.js'
import type { PaymentWebhookEvent } from '../../payment-provider/types/payment-webhook-event.js'

const VALID_EVENT: PaymentWebhookEvent = {
  id: 'evt-1',
  providerSessionId: 'provider-session-1',
  outcome: PAYMENT_SUCCEEDED_OUTCOME,
}

function buildOrchestrator(overrides?: {
  verify?: boolean
  event?: PaymentWebhookEvent | null
}): {
  orchestrator: ReceivePaymentWebhookOrchestrator
  enqueue: ReturnType<typeof vi.fn>
} {
  const verifyWebhookSignature = vi.fn().mockReturnValue(overrides?.verify ?? true)
  const parseWebhookEvent = vi
    .fn()
    .mockReturnValue(overrides?.event === undefined ? VALID_EVENT : overrides.event)
  const paymentProvider = {
    verifyWebhookSignature,
    parseWebhookEvent,
  } as unknown as PaymentProvider

  const enqueue = vi.fn().mockResolvedValue(undefined)
  const paymentEventQueue = { enqueue } as unknown as PaymentEventQueue

  return {
    orchestrator: new ReceivePaymentWebhookOrchestrator(paymentProvider, paymentEventQueue),
    enqueue,
  }
}

describe('ReceivePaymentWebhookOrchestrator', () => {
  it('enqueues the event and returns accepted for a valid, signed webhook', async () => {
    const { orchestrator, enqueue } = buildOrchestrator()

    const result = await orchestrator.receive({ rawBody: '{}', headers: {} })

    expect(result).toEqual({ status: WEBHOOK_ACCEPTED_STATUS })
    expect(enqueue).toHaveBeenCalledWith(VALID_EVENT)
  })

  it('rejects a webhook with an invalid signature', async () => {
    const { orchestrator, enqueue } = buildOrchestrator({ verify: false })

    await expect(
      orchestrator.receive({ rawBody: '{}', headers: {} }),
    ).rejects.toBeInstanceOf(WebhookSignatureInvalidError)
    expect(enqueue).not.toHaveBeenCalled()
  })

  it('ignores an unrecognised event without enqueuing', async () => {
    const { orchestrator, enqueue } = buildOrchestrator({ event: null })

    const result = await orchestrator.receive({ rawBody: '{}', headers: {} })

    expect(result).toEqual({ status: WEBHOOK_IGNORED_STATUS })
    expect(enqueue).not.toHaveBeenCalled()
  })
})
