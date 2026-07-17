import type { ReactNode } from 'react'
import type { ConversationPreview } from '@/types/domain.ts'

export type ConversationListItemProps = {
  title: string
  badge: ReactNode
  preview: string
  isSelected: boolean
  className: string
  onSelect: () => void
}

export type ConversationListItemContainerProps = {
  conversation: ConversationPreview
  isSelected: boolean
  onSelectConversation: (conversationId: string) => void
}
