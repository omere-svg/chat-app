import type { ReactNode } from 'react'
import type { ConversationPreview } from '@/types/domain.ts'
import type {
  ConversationsViewState,
  ReloadConversationsOptions,
} from '@/features/conversations/types/conversations.ts'

export type ChatLayoutContextValue = {
  conversationsState: ConversationsViewState
  conversations: ConversationPreview[]
  selectedConversationId: string | null
  selectConversation: (conversationId: string) => void
  reloadConversations: (options?: ReloadConversationsOptions) => void
  handleConversationCreated: (conversationId: string) => void
}

export type ChatLayoutProviderProps = {
  children: ReactNode
}
