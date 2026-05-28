import { useEffect, useReducer, useRef, useState } from 'react'
import { MESSAGE_PAGE_LIMIT } from '../api/constants.ts'
import { apiClient, ApiError } from '../api/apiClient.ts'
import {
  deriveThreadViewState,
  type ThreadViewState,
} from '../features/messages/deriveThreadViewState.ts'
import {
  initialMessagesState,
  mergeThreadMessages,
  messageReducer,
} from '../features/messages/messageReducer.ts'
import type { Message, PendingMessage } from '../types/domain.ts'

export type { ThreadViewState } from '../features/messages/deriveThreadViewState.ts'

export function useMessages(
  conversationId: string | null,
  currentUserId: string,
  simulateSendFailure: boolean,
  onSendError: (errorMessage: string) => void,
  onSendSuccess?: () => void,
): {
  threadState: ThreadViewState
  threadMessages: Array<Message | PendingMessage>
  hasMoreOlderMessages: boolean
  isLoadingOlderMessages: boolean
  loadOlderMessagesError: string | null
  loadOlderMessages: () => void
  sendMessage: (messageContent: string) => Promise<void>
  isSendingMessage: boolean
  refetchMessages: () => void
} {
  const [state, dispatch] = useReducer(messageReducer, initialMessagesState)
  const onSendErrorRef = useRef(onSendError)
  const onSendSuccessRef = useRef(onSendSuccess)
  const activeConversationIdRef = useRef(conversationId)
  const [loadOlderMessagesError, setLoadOlderMessagesError] = useState<{
    conversationId: string
    message: string
  } | null>(null)

  useEffect(() => {
    onSendErrorRef.current = onSendError
    onSendSuccessRef.current = onSendSuccess
  }, [onSendError, onSendSuccess])

  useEffect(() => {
    activeConversationIdRef.current = conversationId
  }, [conversationId])

  const loadOlderMessagesErrorForConversation =
    loadOlderMessagesError?.conversationId === conversationId
      ? loadOlderMessagesError.message
      : null

  async function loadInitialMessages(
    targetConversationId: string,
    isCancelled: () => boolean,
  ): Promise<void> {
    dispatch({ type: 'FETCH_START' })
    try {
      const { messages, nextCursor } = await apiClient.getMessages(
        targetConversationId,
        { limit: MESSAGE_PAGE_LIMIT },
      )
      if (isCancelled()) return
      if (activeConversationIdRef.current !== targetConversationId) return
      dispatch({
        type: 'FETCH_SUCCESS',
        messages,
        nextCursor,
      })
    } catch (err) {
      if (isCancelled()) return
      if (activeConversationIdRef.current !== targetConversationId) return
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to load messages'
      dispatch({ type: 'FETCH_ERROR', error: errorMessage })
    }
  }

  useEffect(() => {
    if (!conversationId) {
      dispatch({ type: 'RESET' })
      return
    }

    let cancelled = false
    dispatch({ type: 'RESET' })
    void loadInitialMessages(conversationId, () => cancelled)

    return () => {
      cancelled = true
    }
  }, [conversationId])

  function refetchMessages(): void {
    if (!conversationId) return
    void loadInitialMessages(conversationId, () => false)
  }

  function loadOlderMessages(): void {
    if (!conversationId || !state.nextCursor || state.status === 'loading-more') {
      return
    }

    const targetConversationId = conversationId
    const olderMessagesCursor = state.nextCursor

    void (async (): Promise<void> => {
      dispatch({ type: 'FETCH_MORE_START' })
      try {
        const { messages, nextCursor } = await apiClient.getMessages(
          targetConversationId,
          { cursor: olderMessagesCursor, limit: MESSAGE_PAGE_LIMIT },
        )
        if (activeConversationIdRef.current !== targetConversationId) return
        dispatch({
          type: 'FETCH_MORE_SUCCESS',
          messages,
          nextCursor,
        })
      } catch (err) {
        if (activeConversationIdRef.current !== targetConversationId) return
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : 'Failed to load older messages'
        setLoadOlderMessagesError({
          conversationId: targetConversationId,
          message: errorMessage,
        })
        dispatch({ type: 'FETCH_MORE_ERROR' })
      }
    })()
  }

  async function sendMessage(messageContent: string): Promise<void> {
    if (!conversationId || !messageContent.trim()) return

    const targetConversationId = conversationId
    const clientMessageId = `client-${crypto.randomUUID()}`
    const optimisticMessage: PendingMessage = {
      id: clientMessageId,
      clientMessageId,
      conversationId: targetConversationId,
      senderId: currentUserId,
      body: messageContent.trim(),
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: 'OPTIMISTIC_ADD', message: optimisticMessage })

    try {
      const { message } = await apiClient.sendMessage(
        targetConversationId,
        { body: messageContent.trim(), clientMessageId },
        { simulateSendFailure },
      )
      if (activeConversationIdRef.current !== targetConversationId) return
      dispatch({
        type: 'OPTIMISTIC_CONFIRM',
        clientMessageId,
        message,
      })
      onSendSuccessRef.current?.()
    } catch (err) {
      if (activeConversationIdRef.current !== targetConversationId) return
      dispatch({ type: 'OPTIMISTIC_ROLLBACK', clientMessageId })
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to send message'
      onSendErrorRef.current(errorMessage)
    }
  }

  const threadMessages = mergeThreadMessages(state.messages, state.pending)
  const isSendingMessage = state.pending.length > 0
  const threadState = deriveThreadViewState(
    conversationId,
    state,
    threadMessages,
  )

  return {
    threadState,
    threadMessages,
    hasMoreOlderMessages: state.nextCursor !== null,
    isLoadingOlderMessages: state.status === 'loading-more',
    loadOlderMessagesError: loadOlderMessagesErrorForConversation,
    loadOlderMessages,
    sendMessage,
    isSendingMessage,
    refetchMessages,
  }
}
