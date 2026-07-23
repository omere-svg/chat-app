import { useEffect, useRef } from 'react'
import type { Dispatch, RefObject } from 'react'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import type { PendingMessage } from '@/types/domain.ts'
import { MESSAGE_ERROR } from '../constants/messages.ts'
import type { MessagesAction, MessagesState } from '../types/messagesState.ts'
import type { UseSendMessageValue } from '../types/messageThread.ts'

export function useSendMessage(
  conversationId: string | null,
  currentUserId: string,
  onSendError: (errorMessage: string) => void,
  onSendSuccess: (() => void) | undefined,
  state: MessagesState,
  dispatch: Dispatch<MessagesAction>,
  activeConversationIdRef: RefObject<string | null>,
): UseSendMessageValue {
  const onSendErrorRef = useRef(onSendError)
  const onSendSuccessRef = useRef(onSendSuccess)

  useEffect(() => {
    onSendErrorRef.current = onSendError
    onSendSuccessRef.current = onSendSuccess
  }, [onSendError, onSendSuccess])

  async function sendMessage(messageContent: string): Promise<boolean> {
    if (!conversationId || !messageContent.trim()) {
      return false
    }

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
      const { message } = await apiClient.sendMessage(targetConversationId, {
        body: messageContent.trim(),
        clientMessageId,
      })

      if (activeConversationIdRef.current !== targetConversationId) {
        return false
      }

      dispatch({
        type: 'OPTIMISTIC_CONFIRM',
        clientMessageId,
        message,
      })

      onSendSuccessRef.current?.()
      return true
    } catch (err) {
      if (activeConversationIdRef.current !== targetConversationId) {
        return false
      }

      dispatch({ type: 'OPTIMISTIC_ROLLBACK', clientMessageId })

      const errorMessage =
        err instanceof ApiError ? err.message : MESSAGE_ERROR.send

      onSendErrorRef.current(errorMessage)
      return false
    }
  }

  return {
    sendMessage,
    isSendingMessage: state.pending.length > 0,
  }
}
