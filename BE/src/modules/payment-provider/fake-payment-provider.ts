import { randomUUID } from 'node:crypto'
import { PAYMENT_FAILED_OUTCOME, PAYMENT_SUCCEEDED_OUTCOME } from './constants.js'
import type { CheckoutSession, CreateCheckoutSessionInput } from './types/checkout-session.js'
import type { PaymentProvider } from './types/payment-provider.js'
import type { PaymentWebhookEvent } from './types/payment-webhook-event.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export class FakePaymentProvider implements PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    return Promise.resolve({
      providerSessionId: `fake-${randomUUID()}`,
      checkoutUrl: input.successUrl,
    })
  }

  verifyWebhookSignature(): boolean {
    return true
  }

  parseWebhookEvent(rawBody: string): PaymentWebhookEvent | null {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return null
    }

    if (!isRecord(parsed)) {
      return null
    }

    const { id, providerSessionId, outcome } = parsed
    if (typeof id !== 'string' || typeof providerSessionId !== 'string') {
      return null
    }
    if (outcome !== PAYMENT_SUCCEEDED_OUTCOME && outcome !== PAYMENT_FAILED_OUTCOME) {
      return null
    }

    return { id, providerSessionId, outcome }
  }
}
