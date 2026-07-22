import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { SubscriptionCardBody } from './SubscriptionCardBody.tsx'
import { resolveSubscriptionCardStatus } from './SubscriptionCardBody.utils.ts'

export function SubscriptionCardBodyContainer(): React.ReactElement {
  const context = useSubscriptionContext()
  const status = resolveSubscriptionCardStatus(context)

  return (
    <SubscriptionCardBody
      status={status}
      planName={context.proPlan?.name ?? null}
      priceLabel={context.proPriceLabel}
      errorMessage={context.loadError}
      onRetry={context.reload}
    />
  )
}
