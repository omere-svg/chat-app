import type { ReactNode } from 'react'

export type SidebarUserChipContextValue = {
  userName: string
  avatarUrl: string | null
}

export type SidebarUserChipProviderProps = {
  children: ReactNode
}
