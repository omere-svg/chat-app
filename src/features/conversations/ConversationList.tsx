import { EmptyState } from '../../components/EmptyState.tsx'
import { ErrorBanner } from '../../components/ErrorBanner.tsx'
import type { ConversationsViewState } from '../../hooks/useConversations.ts'
import { ConversationListItem } from './ConversationListItem.tsx'
import { ConversationListSkeleton } from './ConversationListSkeleton.tsx'

type ConversationListProps = {
  conversationsState: ConversationsViewState
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onRetryLoad?: () => void
}

export function ConversationList({
  conversationsState,
  selectedConversationId,
  onSelectConversation,
  onRetryLoad,
}: ConversationListProps): React.ReactElement {
  if (conversationsState.status === 'loading') {
    return <ConversationListSkeleton />
  }

  if (conversationsState.status === 'error') {
    return (
      <ErrorBanner
        message={conversationsState.message}
        onRetry={onRetryLoad}
      />
    )
  }

  if (conversationsState.status === 'empty') {
    return (
      <EmptyState
        title="No conversations"
        description="You are not in any conversations yet."
      />
    )
  }

  return (
    <div
      className="conversation-list"
      role="listbox"
      aria-label="Conversations"
    >
      {conversationsState.conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onSelectConversation={onSelectConversation}
        />
      ))}
    </div>
  )
}
