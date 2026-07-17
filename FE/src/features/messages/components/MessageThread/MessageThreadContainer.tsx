import { useState } from 'react'
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useAutoScroll } from '@/shared/hooks/useAutoScroll.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { KnowledgeBasePanelContainer } from '@/features/knowledge/components/KnowledgeBasePanel/KnowledgeBasePanelContainer.tsx'
import { useToast } from '@/features/toast/hooks/useToast.ts'
import { useMessages } from '@/features/messages/hooks/useMessages.ts'
import { getThreadScrollAnchorId } from '@/features/messages/utils/deriveThreadViewState.ts'
import { MessageComposer } from '../MessageComposer/MessageComposer.tsx'
import { MessageListContainer } from '../MessageList/MessageListContainer.tsx'
import { MessageThreadSkeletonContainer } from '../MessageThreadSkeleton/MessageThreadSkeletonContainer.tsx'
import { LoadMoreButton } from './components/LoadMoreButton/LoadMoreButton.tsx'
import { MessageThreadEmpty } from './components/MessageThreadEmpty/MessageThreadEmpty.tsx'
import { MessageThreadHeader } from './components/MessageThreadHeader/MessageThreadHeader.tsx'
import { MessageThreadPlaceholder } from './components/MessageThreadPlaceholder/MessageThreadPlaceholder.tsx'
import { MessageThread } from './MessageThread.tsx'
import type { MessageThreadContainerProps } from './MessageThread.types.ts'

export function MessageThreadContainer({
  selectedConversationId,
  conversations,
  onMessageSendSuccess,
}: MessageThreadContainerProps): React.ReactElement {
  const { currentUser } = useAuth()
  const { showErrorToast } = useToast()
  const [messageDraft, setMessageDraft] = useState('')

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  )
  const currentUserId = currentUser?.id ?? ''

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

  if (threadState.status === 'idle') {
    return <MessageThreadPlaceholder />
  }

  const isReady =
    threadState.status === 'success' || threadState.status === 'empty'

  const loadMore =
    hasMoreOlderMessages && threadState.status === 'success' ? (
      <LoadMoreButton
        loading={isLoadingOlderMessages}
        onClick={loadOlderMessages}
      />
    ) : null

  const loadError = loadOlderMessagesError ? (
    <ErrorBanner message={loadOlderMessagesError} onRetry={loadOlderMessages} />
  ) : null

  const statusContent =
    threadState.status === 'loading' ? (
      <MessageThreadSkeletonContainer />
    ) : threadState.status === 'error' ? (
      <ErrorBanner message={threadState.message} onRetry={refetchMessages} />
    ) : threadState.status === 'empty' ? (
      <MessageThreadEmpty />
    ) : (
      <MessageListContainer
        messages={threadMessages}
        currentUserId={currentUserId}
      />
    )

  return (
    <MessageThread
      header={
        selectedConversation?.title ? (
          <MessageThreadHeader title={selectedConversation.title} />
        ) : null
      }
      knowledgePanel={
        selectedConversation?.type === 'tutor' ? (
          <KnowledgeBasePanelContainer />
        ) : null
      }
      scrollContainerRef={scrollContainerRef}
      body={
        <>
          {loadMore}
          {loadError}
          {statusContent}
        </>
      }
      composer={
        isReady ? (
          <MessageComposer
            messageDraft={messageDraft}
            onMessageDraftChange={setMessageDraft}
            onSendMessage={handleSendMessage}
            disabled={isSendingMessage || !selectedConversationId}
          />
        ) : null
      }
    />
  )
}
