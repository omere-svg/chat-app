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

export type PreviousEmailsState = {
  previousEmails: string[]
  isLoading: boolean
  hasError: boolean
}

export type PreviousEmailsAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; previousEmails: string[] }
  | { type: 'LOAD_ERROR' }
