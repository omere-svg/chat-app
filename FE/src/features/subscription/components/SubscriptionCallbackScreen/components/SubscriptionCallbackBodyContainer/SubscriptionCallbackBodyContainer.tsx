import { useSubscriptionCallbackContext } from '../../context/useSubscriptionCallbackContext.tsx'
import { SUBSCRIPTION_CALLBACK_BODY } from './SubscriptionCallbackBodyContainer.constants.ts'

export function SubscriptionCallbackBodyContainer(): React.ReactElement {
  const { status } = useSubscriptionCallbackContext()
  const Body = SUBSCRIPTION_CALLBACK_BODY[status]

  return <Body />
}
