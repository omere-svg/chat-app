import type { ReactNode } from 'react'

export type SidebarUserChipContextValue = {
  name: string
  avatarUrl: string | null
}

export type SidebarUserChipProviderProps = {
  children: ReactNode
}
