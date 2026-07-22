import type { ActivateSubscriptionInput } from './types/activate-subscription-input.js'
import type { Subscription } from './types/subscription.js'

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY')

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>
  activate(input: ActivateSubscriptionInput): Promise<void>
}
