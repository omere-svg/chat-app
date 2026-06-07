import type { RefObject } from 'react'
import { EmptyState } from '../../components/EmptyState.tsx'
import { ErrorBanner } from '../../components/ErrorBanner.tsx'
import type { ThreadViewState } from './deriveThreadViewState.ts'
import type { Message, PendingMessage } from '../../types/domain.ts'
import { MessageBubble } from './MessageBubble.tsx'
import { MessageComposer } from './MessageComposer.tsx'
import { MessageThreadSkeleton } from './MessageThreadSkeleton.tsx'

type MessageThreadProps = {
  threadState: ThreadViewState
  messages: Array<Message | PendingMessage>
  currentUserId: string
  messageDraft: string
  onMessageDraftChange: (messageDraft: string) => void
  onSendMessage: () => void
  isComposerDisabled: boolean
  hasMoreOlderMessages: boolean
  isLoadingOlderMessages: boolean
  loadOlderMessagesError: string | null
  onLoadOlderMessages: () => void
  onRetryMessages?: () => void
  conversationTitle?: string
  messagesScrollContainerRef?: RefObject<HTMLDivElement | null>
}

export function MessageThread({
  threadState,
  messages,
  currentUserId,
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  isComposerDisabled,
  hasMoreOlderMessages,
  isLoadingOlderMessages,
  loadOlderMessagesError,
  onLoadOlderMessages,
  onRetryMessages,
  conversationTitle,
  messagesScrollContainerRef,
}: MessageThreadProps): React.ReactElement {
  if (threadState.status === 'idle') {
    return (
      <div className="message-thread message-thread--placeholder">
        <EmptyState
          title="Select a conversation"
          description="Choose one from the list to view messages."
        />
      </div>
    )
  }

  return (
    <div className="message-thread">
      {conversationTitle ? (
        <header className="message-thread__header">
          <h2>{conversationTitle}</h2>
        </header>
      ) : null}

      <div className="message-thread__body" ref={messagesScrollContainerRef}>
        {hasMoreOlderMessages && threadState.status === 'success' ? (
          <button
            type="button"
            className="btn btn--secondary message-thread__load-more"
            onClick={onLoadOlderMessages}
            disabled={isLoadingOlderMessages}
          >
            {isLoadingOlderMessages ? 'Loading…' : 'Load older messages'}
          </button>
        ) : null}

        {loadOlderMessagesError ? (
          <ErrorBanner
            message={loadOlderMessagesError}
            onRetry={onLoadOlderMessages}
          />
        ) : null}

        {threadState.status === 'loading' ? <MessageThreadSkeleton /> : null}

        {threadState.status === 'error' ? (
          <ErrorBanner message={threadState.message} onRetry={onRetryMessages} />
        ) : null}

        {threadState.status === 'empty' ? (
          <EmptyState
            title="No messages yet"
            description="Send the first message below."
          />
        ) : null}

        {threadState.status === 'success' ? (
          <div className="message-thread__messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <MessageBubble
                key={
                  'clientMessageId' in message
                    ? message.clientMessageId
                    : message.id
                }
                message={message}
                isOwnMessage={message.senderId === currentUserId}
              />
            ))}
          </div>
        ) : null}
      </div>

      {threadState.status === 'success' || threadState.status === 'empty' ? (
        <MessageComposer
          messageDraft={messageDraft}
          onMessageDraftChange={onMessageDraftChange}
          onSendMessage={onSendMessage}
          disabled={isComposerDisabled}
        />
      ) : null}
    </div>
  )
}
