import type { ConversationType } from '@/types/domain.ts'
import type { UseMessagesValue } from '../types/messageThread.ts'
import { useAssistantStream } from './useAssistantStream.ts'
import { useMessageThread } from './useMessageThread.ts'
import { useOlderMessages } from './useOlderMessages.ts'
import { useSendMessage } from './useSendMessage.ts'

export function useMessages(
  conversationId: string | null,
  currentUserId: string,
  onSendError: (errorMessage: string) => void,
  onSendSuccess?: () => void,
  conversationType: ConversationType = 'direct',
): UseMessagesValue {
  const {
    state,
    dispatch,
    activeConversationIdRef,
    threadState,
    threadMessages,
    refetchMessages,
  } = useMessageThread(conversationId)

  const {
    loadOlderMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
  } = useOlderMessages(conversationId, state, dispatch, activeConversationIdRef)

  const { sendMessage: sendHumanMessage, isSendingMessage: isSendingHumanMessage } =
    useSendMessage(
      conversationId,
      currentUserId,
      onSendError,
      onSendSuccess,
      state,
      dispatch,
      activeConversationIdRef,
    )

  const { sendMessage: sendAssistantMessage, isStreaming } = useAssistantStream(
    conversationId,
    currentUserId,
    onSendError,
    onSendSuccess,
    state,
    dispatch,
    activeConversationIdRef,
  )

  const isStreamingConversation =
    conversationType === 'assistant' || conversationType === 'tutor'

  return {
    threadState,
    threadMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    sendMessage: isStreamingConversation ? sendAssistantMessage : sendHumanMessage,
    isSendingMessage: isStreamingConversation
      ? isStreaming || state.pending.length > 0
      : isSendingHumanMessage,
    refetchMessages,
  }
}
