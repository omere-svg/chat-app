import { Button } from '@/shared/components/Button/Button.tsx'
import { useSubscriptionContext } from '@/features/subscription/context/useSubscriptionContext.tsx'
import { SUBSCRIPTION_CARD_TEXT } from '../../SubscriptionCard.constants.ts'

export function SubscriptionUpgradeButton(): React.ReactElement {
  const { isActive, isLoading, isUpgrading, proPlan } = useSubscriptionContext()

  const label = isActive
    ? SUBSCRIPTION_CARD_TEXT.activeAction
    : isUpgrading
      ? SUBSCRIPTION_CARD_TEXT.upgradingAction
      : SUBSCRIPTION_CARD_TEXT.upgradeAction

  const isDisabled = isActive || isLoading || isUpgrading || proPlan === null

  return (
    <Button type="submit" variant="primary" disabled={isDisabled}>
      {label}
    </Button>
  )
}
