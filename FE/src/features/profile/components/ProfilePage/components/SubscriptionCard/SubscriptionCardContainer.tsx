import { SubscriptionProvider } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { SubscriptionCard } from './SubscriptionCard.tsx'

export function SubscriptionCardContainer(): React.ReactElement {
  return (
    <SubscriptionProvider>
      <SubscriptionCard />
    </SubscriptionProvider>
  )
}
