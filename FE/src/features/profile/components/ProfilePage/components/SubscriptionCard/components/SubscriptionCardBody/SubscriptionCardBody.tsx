import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../SubscriptionCard.constants.ts'
import { resolveSubscriptionCardStatus } from './SubscriptionCardBody.utils.ts'

export function SubscriptionCardBody(): React.ReactElement {
  const context = useSubscriptionContext()
  const { proPlan, proPriceLabel, loadError, reload } = context
  const status = resolveSubscriptionCardStatus(context)

  if (status === 'loading') {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.detail} role="status">
        {SUBSCRIPTION_CARD_TEXT.loading}
      </p>
    )
  }

  if (status === 'error') {
    return <ErrorBanner message={loadError ?? ''} onRetry={reload} />
  }

  if (status === 'active') {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.status} role="status">
        {SUBSCRIPTION_CARD_TEXT.activeStatus}
      </p>
    )
  }

  if (status === 'free') {
    return <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
  }

  return (
    <>
      <p className={SUBSCRIPTION_CARD_CLASS.planName}>{proPlan?.name}</p>
      {proPriceLabel === null ? null : (
        <p className={SUBSCRIPTION_CARD_CLASS.price}>{proPriceLabel}</p>
      )}
      <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
    </>
  )
}
