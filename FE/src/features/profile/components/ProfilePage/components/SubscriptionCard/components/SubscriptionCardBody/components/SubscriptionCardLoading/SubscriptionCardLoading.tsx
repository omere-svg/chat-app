import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../../../SubscriptionCard.constants.ts'

export function SubscriptionCardLoading(): React.ReactElement {
  return (
    <p className={SUBSCRIPTION_CARD_CLASS.detail} role="status">
      {SUBSCRIPTION_CARD_TEXT.loading}
    </p>
  )
}
