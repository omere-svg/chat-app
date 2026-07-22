import type { ReactNode } from 'react'
import type { SUBSCRIPTION_CALLBACK_FAILURE_REASON } from './SubscriptionCallbackScreen.constants.ts'

export type SubscriptionCallbackFailureReason =
  (typeof SUBSCRIPTION_CALLBACK_FAILURE_REASON)[keyof typeof SUBSCRIPTION_CALLBACK_FAILURE_REASON]

export type SubscriptionCallbackState =
  | { status: 'processing'; failureReason: null }
  | { status: 'success'; failureReason: null }
  | { status: 'failed'; failureReason: SubscriptionCallbackFailureReason }

export type SubscriptionCallbackAction =
  | { type: 'PROCESSING' }
  | { type: 'SUCCESS' }
  | { type: 'FAILED'; reason: SubscriptionCallbackFailureReason }

export type SubscriptionCallbackScreenProps = {
  children: ReactNode
}

export type SubscriptionCallbackProviderProps = {
  children: ReactNode
}
