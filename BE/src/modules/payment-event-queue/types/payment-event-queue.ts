import type { PaymentWebhookEvent } from '../../payment-provider/types/payment-webhook-event.js'

export interface ReceivedPaymentEvent {
  event: PaymentWebhookEvent
  receiptHandle: string
}

export interface PaymentEventQueue {
  enqueue(event: PaymentWebhookEvent): Promise<void>
  receive(): Promise<ReceivedPaymentEvent[]>
  acknowledge(receiptHandle: string): Promise<void>
}
