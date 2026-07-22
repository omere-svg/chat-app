import { PAYMENT_FAILED_OUTCOME, PAYMENT_SUCCEEDED_OUTCOME } from '../payment-provider/constants.js'
import type { PaymentWebhookEvent } from '../payment-provider/types/payment-webhook-event.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parsePaymentEventMessage(rawMessage: string): PaymentWebhookEvent | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawMessage)
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
