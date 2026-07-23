import type { ReactNode } from 'react'

export type ChatTopbarContextValue = {
  userName: string
  avatarUrl: string | null
  logout: () => void
}

export type ChatTopbarProviderProps = {
  children: ReactNode
}
