import type { CheckoutSession, CreateCheckoutSessionInput } from './checkout-session.js'
import type { PaymentWebhookEvent } from './payment-webhook-event.js'
import type { WebhookVerificationInput } from './webhook-verification-input.js'

export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>
  verifyWebhookSignature(input: WebhookVerificationInput): boolean
  parseWebhookEvent(rawBody: string): PaymentWebhookEvent | null
}
