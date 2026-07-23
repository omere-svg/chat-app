import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'

export function SubscriptionCardError(): React.ReactElement {
  const { loadError, reload } = useSubscriptionContext()

  return <ErrorBanner message={loadError ?? ''} onRetry={reload} />
}
