import type { WebhookHeaders } from '../../payment-provider/types/webhook-verification-input.js'

export interface ReceivePaymentWebhookInput {
  rawBody: string
  headers: WebhookHeaders
}
