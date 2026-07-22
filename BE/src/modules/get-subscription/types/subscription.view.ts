import type { SubscriptionStatus } from '../../subscriptions/types/subscription.js'

export interface SubscriptionView {
  status: SubscriptionStatus
  planCode: string | null
  activatedAt: string | null
}
