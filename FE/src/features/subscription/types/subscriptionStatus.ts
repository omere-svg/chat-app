import type { Plan, Subscription } from '@/types/domain.ts'

export type SubscriptionStatusState = {
  subscription: Subscription | null
  proPlan: Plan | null
  isLoading: boolean
  loadError: string | null
}

export type SubscriptionStatusAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; subscription: Subscription; proPlan: Plan | null }
  | { type: 'LOAD_ERROR' }
