import type { SubscriptionDocument } from './subscription.schema.js'
import type { Subscription } from './types/subscription.js'

export function toSubscription(document: SubscriptionDocument): Subscription {
  return {
    userId: document._id,
    planCode: document.planCode ?? null,
    status: document.status,
    activatedAt: document.activatedAt ?? null,
  }
}
