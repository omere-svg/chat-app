import { Module } from '@nestjs/common'
import { PaymentSessionModule } from '../payment-sessions/payment-session.module.js'
import { SubscriptionModule } from '../subscriptions/subscription.module.js'
import { ProcessPaymentEventOrchestrator } from './process-payment-event.orchestrator.js'

@Module({
  imports: [PaymentSessionModule, SubscriptionModule],
  providers: [ProcessPaymentEventOrchestrator],
  exports: [ProcessPaymentEventOrchestrator],
})
export class ProcessPaymentEventModule {}
