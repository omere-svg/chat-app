import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { SUBSCRIPTION_CARD_BODY } from './SubscriptionCardBody.constants.ts'
import { resolveSubscriptionCardStatus } from './SubscriptionCardBody.utils.ts'

export function SubscriptionCardBody(): React.ReactElement {
  const status = resolveSubscriptionCardStatus(useSubscriptionContext())
  const Body = SUBSCRIPTION_CARD_BODY[status]

  return <Body />
}
