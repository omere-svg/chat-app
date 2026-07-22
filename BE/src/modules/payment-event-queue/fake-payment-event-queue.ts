import { randomUUID } from 'node:crypto'
import type { PaymentWebhookEvent } from '../payment-provider/types/payment-webhook-event.js'
import type { PaymentEventQueue, ReceivedPaymentEvent } from './types/payment-event-queue.js'

export class FakePaymentEventQueue implements PaymentEventQueue {
  private readonly buffer: ReceivedPaymentEvent[] = []

  enqueue(event: PaymentWebhookEvent): Promise<void> {
    this.buffer.push({ event, receiptHandle: `fake-${randomUUID()}` })
    return Promise.resolve()
  }

  receive(): Promise<ReceivedPaymentEvent[]> {
    const drained = this.buffer.splice(0, this.buffer.length)
    return Promise.resolve(drained)
  }

  acknowledge(): Promise<void> {
    return Promise.resolve()
  }
}
