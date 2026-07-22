import { SUBSCRIPTION_TEXT } from '../constants.ts'
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

export const initialSubscriptionStatusState: SubscriptionStatusState = {
  subscription: null,
  proPlan: null,
  isLoading: true,
  loadError: null,
}

export function subscriptionStatusReducer(
  state: SubscriptionStatusState,
  action: SubscriptionStatusAction,
): SubscriptionStatusState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, loadError: null }
    case 'LOAD_SUCCESS':
      return {
        subscription: action.subscription,
        proPlan: action.proPlan,
        isLoading: false,
        loadError: null,
      }
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, loadError: SUBSCRIPTION_TEXT.loadError }
  }
}
