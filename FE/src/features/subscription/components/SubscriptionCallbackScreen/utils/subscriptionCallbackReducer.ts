import type {
  SubscriptionCallbackAction,
  SubscriptionCallbackState,
} from '../SubscriptionCallbackScreen.types.ts'

export const initialSubscriptionCallbackState: SubscriptionCallbackState = {
  status: 'processing',
  failureReason: null,
}

export function subscriptionCallbackReducer(
  _state: SubscriptionCallbackState,
  action: SubscriptionCallbackAction,
): SubscriptionCallbackState {
  switch (action.type) {
    case 'PROCESSING':
      return { status: 'processing', failureReason: null }
    case 'SUCCESS':
      return { status: 'success', failureReason: null }
    case 'FAILED':
      return { status: 'failed', failureReason: action.reason }
  }
}
