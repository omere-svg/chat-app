import { Module } from '@nestjs/common'
import { SubscriptionModule } from '../subscriptions/subscription.module.js'
import { GetSubscriptionOrchestrator } from './get-subscription.orchestrator.js'

@Module({
  imports: [SubscriptionModule],
  providers: [GetSubscriptionOrchestrator],
  exports: [GetSubscriptionOrchestrator],
})
export class GetSubscriptionModule {}
