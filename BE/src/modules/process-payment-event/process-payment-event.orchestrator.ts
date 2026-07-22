import { Injectable, Logger } from '@nestjs/common'
import { PaymentSessionService } from '../payment-sessions/payment-session.service.js'
import { SubscriptionService } from '../subscriptions/subscription.service.js'
import {
  PAYMENT_SESSION_COMPLETED_STATUS,
  PAYMENT_SESSION_FAILED_STATUS,
} from '../payment-sessions/constants.js'
import { PAYMENT_SUCCEEDED_OUTCOME } from '../payment-provider/constants.js'
import type { PaymentWebhookEvent } from '../payment-provider/types/payment-webhook-event.js'

@Injectable()
export class ProcessPaymentEventOrchestrator {
  private readonly logger = new Logger(ProcessPaymentEventOrchestrator.name)

  constructor(
    private readonly paymentSessionService: PaymentSessionService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async process(event: PaymentWebhookEvent): Promise<void> {
    const session = await this.paymentSessionService.findByProviderSessionId(event.providerSessionId)
    if (session === null) {
      this.logger.warn(`Ignoring payment event for unknown provider session ${event.providerSessionId}`)
      return
    }

    if (event.outcome === PAYMENT_SUCCEEDED_OUTCOME) {
      const transitioned = await this.paymentSessionService.transition({
        id: session.id,
        status: PAYMENT_SESSION_COMPLETED_STATUS,
        eventId: event.id,
      })
      if (transitioned) {
        await this.subscriptionService.activate(session.userId, session.planCode)
      }
      return
    }

    await this.paymentSessionService.transition({
      id: session.id,
      status: PAYMENT_SESSION_FAILED_STATUS,
      eventId: event.id,
    })
  }
}
