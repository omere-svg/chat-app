import { useCallback, useState } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { SUBSCRIPTION_TEXT } from '../constants/subscription.ts'

export function useUpgradeSubscription() {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  const upgrade = useCallback(async (planCode: string): Promise<void> => {
    setIsUpgrading(true)
    setUpgradeError(null)
    try {
      const { checkoutUrl } = await apiClient.createPaymentSession({ planCode })
      window.location.assign(checkoutUrl)
    } catch {
      setUpgradeError(SUBSCRIPTION_TEXT.upgradeError)
      setIsUpgrading(false)
    }
  }, [])

  return { upgrade, isUpgrading, upgradeError }
}
