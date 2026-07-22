import { CallbackFailed } from '../CallbackFailed/CallbackFailed.tsx'
import { CallbackProcessing } from '../CallbackProcessing/CallbackProcessing.tsx'
import { CallbackSuccess } from '../CallbackSuccess/CallbackSuccess.tsx'
import type { SubscriptionCallbackState } from '../../SubscriptionCallbackScreen.types.ts'

export const SUBSCRIPTION_CALLBACK_BODY: Record<
  SubscriptionCallbackState['status'],
  React.ComponentType
> = {
  processing: CallbackProcessing,
  success: CallbackSuccess,
  failed: CallbackFailed,
}
