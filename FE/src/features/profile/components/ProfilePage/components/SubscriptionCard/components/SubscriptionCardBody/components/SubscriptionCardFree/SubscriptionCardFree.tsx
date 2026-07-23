import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../../../SubscriptionCard.constants.ts'

export function SubscriptionCardFree(): React.ReactElement {
  return <p className={SUBSCRIPTION_CARD_CLASS.detail}>{SUBSCRIPTION_CARD_TEXT.freeTagline}</p>
}
