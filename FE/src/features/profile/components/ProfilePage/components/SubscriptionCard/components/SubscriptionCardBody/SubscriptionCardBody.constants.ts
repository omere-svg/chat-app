import { SubscriptionCardActive } from './components/SubscriptionCardActive/SubscriptionCardActive.tsx'
import { SubscriptionCardError } from './components/SubscriptionCardError/SubscriptionCardError.tsx'
import { SubscriptionCardFree } from './components/SubscriptionCardFree/SubscriptionCardFree.tsx'
import { SubscriptionCardLoading } from './components/SubscriptionCardLoading/SubscriptionCardLoading.tsx'
import { SubscriptionCardPlan } from './components/SubscriptionCardPlan/SubscriptionCardPlan.tsx'
import type { SubscriptionCardStatus } from './SubscriptionCardBody.types.ts'

export const SUBSCRIPTION_CARD_BODY: Record<SubscriptionCardStatus, React.ComponentType> = {
  loading: SubscriptionCardLoading,
  error: SubscriptionCardError,
  active: SubscriptionCardActive,
  free: SubscriptionCardFree,
  plan: SubscriptionCardPlan,
}
