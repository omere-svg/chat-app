import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../SubscriptionCard.constants.ts'
import type { SubscriptionCardBodyProps } from './SubscriptionCardBody.types.ts'

export function SubscriptionCardBody({
  status,
  planName,
  priceLabel,
  errorMessage,
  onRetry,
}: SubscriptionCardBodyProps): React.ReactElement {
  if (status === 'loading') {
    return (
      <p className={SUBSCRIPTION_CARD_CLASS.detail} role="status">
        {SUBSCRIPTION_CARD_TEXT.loading}
      </p>
    )
  }

  if (status === 'error') {
    return <ErrorBanner message={errorMessage ?? ''} onRetry={onRetry} />
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
      <p className={SUBSCRIPTION_CARD_CLASS.planName}>{planName}</p>
      {priceLabel === null ? null : (
        <p className={SUBSCRIPTION_CARD_CLASS.price}>{priceLabel}</p>
      )}
      <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
    </>
  )
}
