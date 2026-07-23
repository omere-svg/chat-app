import type { ReactNode } from 'react'
import type { ConversationPreview } from '@/types/domain.ts'

export type ConversationItemContextValue = {
  title: string
  preview: string
  badgeLabel: string | null
  isSelected: boolean
  className: string
  onSelect: () => void
}

export type ConversationItemProviderProps = {
  conversation: ConversationPreview
  children: ReactNode
}
