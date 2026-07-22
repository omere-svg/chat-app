import type { SUBSCRIPTION_ACTIVE_STATUS, SUBSCRIPTION_NONE_STATUS } from '../constants.js'

export type SubscriptionStatus =
  | typeof SUBSCRIPTION_ACTIVE_STATUS
  | typeof SUBSCRIPTION_NONE_STATUS

export interface Subscription {
  userId: string
  planCode: string | null
  status: SubscriptionStatus
  activatedAt: Date | null
}
