import type { FormEvent, ReactNode } from 'react'
import type { Plan, Subscription } from '@/types/domain.ts'

export type SubscriptionContextValue = {
  subscription: Subscription | null
  proPlan: Plan | null
  proPriceLabel: string | null
  isActive: boolean
  isLoading: boolean
  loadError: string | null
  reload: () => void
  upgrade: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  isUpgrading: boolean
  upgradeError: string | null
}

export type SubscriptionProviderProps = {
  children: ReactNode
}
