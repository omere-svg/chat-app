import type { ReactNode } from 'react'

export type ChatTopbarProps = {
  userName: string
  avatar: ReactNode
  onLogout: () => void
}
