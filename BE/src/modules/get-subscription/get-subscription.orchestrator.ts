import { Injectable } from '@nestjs/common'
import { SubscriptionService } from '../subscriptions/subscription.service.js'
import { toSubscriptionView } from './subscription-view.mapper.js'
import type { SubscriptionView } from './types/subscription.view.js'

@Injectable()
export class GetSubscriptionOrchestrator {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async get(userId: string): Promise<SubscriptionView> {
    const subscription = await this.subscriptionService.getForUser(userId)
    return toSubscriptionView(subscription)
  }
}
