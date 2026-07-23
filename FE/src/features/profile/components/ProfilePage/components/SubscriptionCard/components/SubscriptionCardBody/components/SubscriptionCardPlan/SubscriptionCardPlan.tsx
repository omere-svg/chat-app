import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import {
  SUBSCRIPTION_CARD_CLASS,
  SUBSCRIPTION_CARD_TEXT,
} from '../../../../SubscriptionCard.constants.ts'

export function SubscriptionCardPlan(): React.ReactElement {
  const { proPlan, proPriceLabel } = useSubscriptionContext()

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
