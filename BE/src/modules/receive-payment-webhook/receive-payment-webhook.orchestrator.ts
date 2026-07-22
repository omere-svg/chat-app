import { Inject, Injectable } from '@nestjs/common'
import { PAYMENT_PROVIDER } from '../payment-provider/payment-provider.tokens.js'
import { PAYMENT_EVENT_QUEUE } from '../payment-event-queue/payment-event-queue.tokens.js'
import { WebhookSignatureInvalidError } from './errors/webhook-signature-invalid.error.js'
import { WEBHOOK_ACCEPTED_STATUS, WEBHOOK_IGNORED_STATUS } from './constants.js'
import type { PaymentProvider } from '../payment-provider/types/payment-provider.js'
import type { PaymentEventQueue } from '../payment-event-queue/types/payment-event-queue.js'
import type { ReceivePaymentWebhookInput } from './types/receive-payment-webhook-input.js'
import type { ReceivePaymentWebhookResult } from './types/receive-payment-webhook-result.js'

@Injectable()
export class ReceivePaymentWebhookOrchestrator {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
    @Inject(PAYMENT_EVENT_QUEUE) private readonly paymentEventQueue: PaymentEventQueue,
  ) {}

  async receive({ rawBody, headers }: ReceivePaymentWebhookInput): Promise<ReceivePaymentWebhookResult> {
    if (!this.paymentProvider.verifyWebhookSignature({ rawBody, headers })) {
      throw new WebhookSignatureInvalidError()
    }

    const event = this.paymentProvider.parseWebhookEvent(rawBody)
    if (event === null) {
      return { status: WEBHOOK_IGNORED_STATUS }
    }

    await this.paymentEventQueue.enqueue(event)
    return { status: WEBHOOK_ACCEPTED_STATUS }
  }
}
