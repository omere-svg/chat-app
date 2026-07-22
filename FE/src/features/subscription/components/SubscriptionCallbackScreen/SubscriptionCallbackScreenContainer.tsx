import { SubscriptionCallbackScreen } from './SubscriptionCallbackScreen.tsx'
import { SubscriptionCallbackBodyContainer } from './components/SubscriptionCallbackBodyContainer/SubscriptionCallbackBodyContainer.tsx'
import { SubscriptionCallbackProvider } from './context/useSubscriptionCallbackContext.tsx'

export function SubscriptionCallbackScreenContainer(): React.ReactElement {
  return (
    <SubscriptionCallbackProvider>
      <SubscriptionCallbackScreen>
        <SubscriptionCallbackBodyContainer />
      </SubscriptionCallbackScreen>
    </SubscriptionCallbackProvider>
  )
}
