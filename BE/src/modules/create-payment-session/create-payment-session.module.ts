import { Module } from '@nestjs/common'
import { PlanModule } from '../plans/plan.module.js'
import { SubscriptionModule } from '../subscriptions/subscription.module.js'
import { PaymentSessionModule } from '../payment-sessions/payment-session.module.js'
import { PaymentProviderModule } from '../payment-provider/payment-provider.module.js'
import { CreatePaymentSessionOrchestrator } from './create-payment-session.orchestrator.js'

@Module({
  imports: [PlanModule, SubscriptionModule, PaymentSessionModule, PaymentProviderModule],
  providers: [CreatePaymentSessionOrchestrator],
  exports: [CreatePaymentSessionOrchestrator],
})
export class CreatePaymentSessionModule {}
