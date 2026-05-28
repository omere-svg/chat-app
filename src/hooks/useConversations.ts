import { useEffect, useState } from 'react'
import { apiClient, ApiError } from '../api/apiClient.ts'
import type { ConversationPreview } from '../types/domain.ts'

export type ConversationsViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'success'; conversations: ConversationPreview[] }
  | { status: 'error'; message: string }

export function useConversations(): {
  conversationsState: ConversationsViewState
  reloadConversations: () => void
} {
  const [conversationsState, setConversationsState] =
    useState<ConversationsViewState>({ status: 'loading' })

  async function reloadConversations(): Promise<void> {
    setConversationsState({ status: 'loading' })
    try {
      const { conversations } = await apiClient.getConversations()
      if (conversations.length === 0) {
        setConversationsState({ status: 'empty' })
      } else {
        setConversationsState({ status: 'success', conversations })
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Failed to load conversations'
      setConversationsState({ status: 'error', message: errorMessage })
    }
  }

  useEffect(() => {
    void reloadConversations()
  }, [])

  return { conversationsState, reloadConversations }
}
