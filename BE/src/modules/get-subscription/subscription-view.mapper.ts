import type { Subscription } from '../subscriptions/types/subscription.js'
import type { SubscriptionView } from './types/subscription.view.js'

export function toSubscriptionView(subscription: Subscription): SubscriptionView {
  return {
    status: subscription.status,
    planCode: subscription.planCode,
    activatedAt:
      subscription.activatedAt === null ? null : subscription.activatedAt.toISOString(),
  }
}
