import { Module } from '@nestjs/common'
import { PaymentProviderModule } from '../payment-provider/payment-provider.module.js'
import { PaymentEventQueueModule } from '../payment-event-queue/payment-event-queue.module.js'
import { ReceivePaymentWebhookOrchestrator } from './receive-payment-webhook.orchestrator.js'

@Module({
  imports: [PaymentProviderModule, PaymentEventQueueModule],
  providers: [ReceivePaymentWebhookOrchestrator],
  exports: [ReceivePaymentWebhookOrchestrator],
})
export class ReceivePaymentWebhookModule {}
