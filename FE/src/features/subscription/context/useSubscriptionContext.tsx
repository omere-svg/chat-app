import { createContext, useContext } from 'react'
import type { FormEvent } from 'react'
import { SUBSCRIPTION_ACTIVE_STATUS } from '@/api/constants.ts'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus.ts'
import { useUpgradeSubscription } from '../hooks/useUpgradeSubscription.ts'
import { formatPlanPrice } from '../utils/formatPlanPrice.ts'
import type {
  SubscriptionContextValue,
  SubscriptionProviderProps,
} from './useSubscriptionContext.types.ts'

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({
  children,
}: SubscriptionProviderProps): React.ReactElement {
  const { subscription, proPlan, isLoading, loadError, reload } = useSubscriptionStatus()
  const { upgrade: upgradeWithPlan, isUpgrading, upgradeError } = useUpgradeSubscription()

  const isActive = subscription?.status === SUBSCRIPTION_ACTIVE_STATUS

  const upgrade = (): void => {
    if (proPlan !== null) {
      void upgradeWithPlan(proPlan.code)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isActive || isUpgrading || proPlan === null) {
      return
    }
    upgrade()
  }

  const value: SubscriptionContextValue = {
    subscription,
    proPlan,
    proPriceLabel: proPlan === null ? null : formatPlanPrice(proPlan),
    isActive,
    isLoading,
    loadError,
    reload: () => {
      void reload()
    },
    handleSubmit,
    isUpgrading,
    upgradeError,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext)
  if (context === null) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}
