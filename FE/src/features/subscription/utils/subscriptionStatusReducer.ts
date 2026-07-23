import { SUBSCRIPTION_TEXT } from '../constants/subscription.ts'
import type {
  SubscriptionStatusAction,
  SubscriptionStatusState,
} from '../types/subscriptionStatus.ts'

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
