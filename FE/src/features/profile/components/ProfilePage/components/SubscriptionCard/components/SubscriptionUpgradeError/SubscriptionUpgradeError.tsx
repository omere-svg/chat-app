import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'

export function SubscriptionUpgradeError(): React.ReactElement | null {
  const { upgradeError } = useSubscriptionContext()

  if (upgradeError === null) {
    return null
  }

  return <ErrorBanner message={upgradeError} />
}
