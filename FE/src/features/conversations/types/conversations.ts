import type { ConversationPreview } from '@/types/domain.ts'

export type ConversationsViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'success'; conversations: ConversationPreview[] }
  | { status: 'error'; message: string }

export type ReloadConversationsOptions = {
  quiet?: boolean
}

export type UseConversationsValue = {
  conversationsState: ConversationsViewState
  reloadConversations: (options?: ReloadConversationsOptions) => Promise<void>
}
