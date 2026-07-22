import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../SubscriptionCard.constants.ts'

export function SubscriptionCardBody(): React.ReactElement {
  const { proPlan, proPriceLabel, isActive, isLoading, loadError, reload } =
    useSubscriptionContext()

  if (isLoading) {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.detail} role="status">
        {SUBSCRIPTION_CARD_TEXT.loading}
      </p>
    )
  }

  if (loadError !== null) {
    return <ErrorBanner message={loadError} onRetry={reload} />
  }

  if (isActive) {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.status} role="status">
        {SUBSCRIPTION_CARD_TEXT.activeStatus}
      </p>
    )
  }

  if (proPlan === null) {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
    )
  }

  return (
    <>
      <p className={SUBSCRIPTION_CARD_CLASS.planName}>{proPlan.name}</p>
      {proPriceLabel === null ? null : (
        <p className={SUBSCRIPTION_CARD_CLASS.price}>{proPriceLabel}</p>
      )}
      <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
    </>
  )
}
