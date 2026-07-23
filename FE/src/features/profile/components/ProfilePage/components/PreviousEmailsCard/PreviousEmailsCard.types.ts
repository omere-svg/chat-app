import type { ReactNode } from 'react'

export type UsePreviousEmailsValue = {
  previousEmails: string[]
  isLoading: boolean
  hasError: boolean
}

export type PreviousEmailsCardProps = {
  children: ReactNode
}

export type PreviousEmailsProviderProps = {
  children: ReactNode
}
