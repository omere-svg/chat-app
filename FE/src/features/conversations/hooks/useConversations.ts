import { useEffect, useRef, useState } from 'react'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { CONVERSATIONS_ERROR } from '../constants/conversations.ts'
import type {
  ConversationsViewState,
  ReloadConversationsOptions,
  UseConversationsValue,
} from '../types/conversations.ts'

export function useConversations(): UseConversationsValue {
  const [conversationsState, setConversationsState] =
    useState<ConversationsViewState>({ status: 'loading' })
  const latestRequestIdRef = useRef(0)

  async function reloadConversations(
    options?: ReloadConversationsOptions,
  ): Promise<void> {
    const requestId = latestRequestIdRef.current + 1
    latestRequestIdRef.current = requestId

    if (!options?.quiet) {
      setConversationsState({ status: 'loading' })
    }

    try {
      const { conversations } = await apiClient.getConversations()

      if (requestId !== latestRequestIdRef.current) {
        return
      }

      if (conversations.length === 0) {
        setConversationsState({ status: 'empty' })
      } else {
        setConversationsState({ status: 'success', conversations })
      }
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) {
        return
      }

      const errorMessage =
        err instanceof ApiError ? err.message : CONVERSATIONS_ERROR.load

      setConversationsState({ status: 'error', message: errorMessage })
    }
  }

  useEffect(() => {
    void reloadConversations()
  }, [])

  return { conversationsState, reloadConversations }
}
