import type { SubscriptionContextValue } from '@/features/subscription/context/useSubscriptionContext.types.ts'
import type { SubscriptionCardStatus } from './SubscriptionCardBody.types.ts'

export function resolveSubscriptionCardStatus({
  isLoading,
  loadError,
  isActive,
  proPlan,
}: SubscriptionContextValue): SubscriptionCardStatus {
  if (isLoading) {
    return 'loading'
  }
  if (loadError !== null) {
    return 'error'
  }
  if (isActive) {
    return 'active'
  }
  if (proPlan === null) {
    return 'free'
  }
  return 'plan'
}
