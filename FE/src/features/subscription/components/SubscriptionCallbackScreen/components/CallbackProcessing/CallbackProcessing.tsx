import {
  SUBSCRIPTION_CALLBACK_CLASS,
  SUBSCRIPTION_CALLBACK_TEXT,
} from '../../SubscriptionCallbackScreen.constants.ts'

export function CallbackProcessing(): React.ReactElement {
  return (
    <p className={SUBSCRIPTION_CALLBACK_CLASS.message} role="status">
      {SUBSCRIPTION_CALLBACK_TEXT.processing}
    </p>
  )
}
