import type { PAYMENT_FAILED_OUTCOME, PAYMENT_SUCCEEDED_OUTCOME } from '../constants.js'

export type PaymentOutcome = typeof PAYMENT_SUCCEEDED_OUTCOME | typeof PAYMENT_FAILED_OUTCOME

export interface PaymentWebhookEvent {
  id: string
  providerSessionId: string
  outcome: PaymentOutcome
}
