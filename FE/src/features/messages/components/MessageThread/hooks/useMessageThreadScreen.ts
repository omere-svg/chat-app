import { useState } from 'react'
import { useAutoScroll } from '@/shared/hooks/useAutoScroll.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useChatLayout } from '@/app/components/ChatLayout/context/useChatLayoutContext.tsx'
import { useToast } from '@/features/toast/hooks/useToast.ts'
import { useMessages } from '@/features/messages/hooks/useMessages.ts'
import { getThreadScrollAnchorId } from '@/features/messages/utils/deriveThreadViewState.ts'
import { ASSISTANT_DISPLAY_NAME, ASSISTANT_SENDER_ID } from '@/types/domain.constants.ts'
import { getFullName } from '@/types/domain.utils.ts'
import type { SenderProfile } from '@/features/messages/context/senders.types.ts'
import type { UseMessageThreadScreenValue } from '../context/useMessageThreadContext.types.ts'

export function useMessageThreadScreen(): UseMessageThreadScreenValue {
  const { currentUser } = useAuth()
  const { selectedConversationId, conversations, reloadConversations } = useChatLayout()
  const { showErrorToast } = useToast()
  const [messageDraft, setMessageDraft] = useState('')

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  )
  const currentUserId = currentUser?.id ?? ''

  function onMessageSendSuccess(): void {
    reloadConversations({ quiet: true })
  }

  const sendersById = new Map<string, SenderProfile>()
  for (const participant of selectedConversation?.participants ?? []) {
    sendersById.set(participant.id, {
      id: participant.id,
      name: getFullName(participant),
      avatarUrl: participant.avatarUrl ?? null,
    })
  }
  if (currentUser) {
    sendersById.set(currentUser.id, {
      id: currentUser.id,
      name: getFullName(currentUser),
      avatarUrl: currentUser.avatarUrl ?? null,
    })
  }
  sendersById.set(ASSISTANT_SENDER_ID, {
    id: ASSISTANT_SENDER_ID,
    name: ASSISTANT_DISPLAY_NAME,
    avatarUrl: null,
  })
  const senders = [...sendersById.values()]

  const {
    threadState,
    threadMessages,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    sendMessage,
    isSendingMessage,
    refetchMessages,
  } = useMessages(
    selectedConversationId,
    currentUserId,
    showErrorToast,
    onMessageSendSuccess,
    selectedConversation?.type ?? 'direct',
  )

  const scrollContainerRef = useAutoScroll<HTMLDivElement>(
    getThreadScrollAnchorId(threadMessages),
  )

  function handleSendMessage(): void {
    const messageContent = messageDraft.trim()
    if (!messageContent || isSendingMessage) {
      return
    }
    void (async (): Promise<void> => {
      const didSend = await sendMessage(messageContent)
      if (didSend) {
        setMessageDraft('')
      }
    })()
  }

  const isReady =
    threadState.status === 'success' || threadState.status === 'empty'

  const isComposerDisabled = isSendingMessage || !selectedConversationId
  const isSendDisabled = isComposerDisabled || messageDraft.trim().length === 0

  return {
    threadState,
    threadMessages,
    conversationTitle: selectedConversation?.title ?? null,
    isTutorConversation: selectedConversation?.type === 'tutor',
    senders,
    scrollContainerRef,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessagesError,
    loadOlderMessages,
    refetchMessages,
    messageDraft,
    onMessageDraftChange: setMessageDraft,
    handleSendMessage,
    isReady,
    isSendingMessage,
    isComposerDisabled,
    isSendDisabled,
  }
}
