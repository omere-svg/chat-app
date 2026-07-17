import type { ReactNode } from 'react'
import type { ConversationsViewState } from '@/features/conversations/types/conversations.ts'

export type ConversationListProps = {
  items: ReactNode
}

export type ConversationListContainerProps = {
  conversationsState: ConversationsViewState
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onRetryLoad?: () => void
}
