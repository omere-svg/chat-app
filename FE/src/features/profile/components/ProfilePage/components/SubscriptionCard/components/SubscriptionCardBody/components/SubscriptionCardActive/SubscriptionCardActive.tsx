import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../../../SubscriptionCard.constants.ts'

export function SubscriptionCardActive(): React.ReactElement {
  return (
    <p className={SUBSCRIPTION_CARD_CLASS.status} role="status">
      {SUBSCRIPTION_CARD_TEXT.activeStatus}
    </p>
  )
}
