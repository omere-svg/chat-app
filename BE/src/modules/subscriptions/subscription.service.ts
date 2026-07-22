import { Inject, Injectable } from '@nestjs/common'
import { SUBSCRIPTION_ACTIVE_STATUS, SUBSCRIPTION_NONE_STATUS } from './constants.js'
import { SUBSCRIPTION_REPOSITORY } from './subscription.repository.js'
import type { SubscriptionRepository } from './subscription.repository.js'
import type { Subscription } from './types/subscription.js'

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async getForUser(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByUserId(userId)
    if (subscription !== null) {
      return subscription
    }
    return { userId, planCode: null, status: SUBSCRIPTION_NONE_STATUS, activatedAt: null }
  }

  async isActive(userId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findByUserId(userId)
    return subscription?.status === SUBSCRIPTION_ACTIVE_STATUS
  }

  async activate(userId: string, planCode: string): Promise<void> {
    await this.subscriptionRepository.activate({ userId, planCode, activatedAt: new Date() })
  }
}
