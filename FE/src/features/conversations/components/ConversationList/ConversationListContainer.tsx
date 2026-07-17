import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { ConversationEmptyState } from '../ConversationEmptyState/ConversationEmptyState.tsx'
import { ConversationListItemContainer } from '../ConversationListItem/ConversationListItemContainer.tsx'
import { ConversationListSkeletonContainer } from '../ConversationListSkeleton/ConversationListSkeletonContainer.tsx'
import { ConversationList } from './ConversationList.tsx'
import type { ConversationListContainerProps } from './ConversationList.types.ts'

export function ConversationListContainer({
  conversationsState,
  selectedConversationId,
  onSelectConversation,
  onRetryLoad,
}: ConversationListContainerProps): React.ReactElement {
  if (conversationsState.status === 'loading') {
    return <ConversationListSkeletonContainer />
  }

  if (conversationsState.status === 'error') {
    return <ErrorBanner message={conversationsState.message} onRetry={onRetryLoad} />
  }

  if (conversationsState.status === 'empty') {
    return <ConversationEmptyState />
  }

  const items = conversationsState.conversations.map((conversation) => (
    <ConversationListItemContainer
      key={conversation.id}
      conversation={conversation}
      isSelected={conversation.id === selectedConversationId}
      onSelectConversation={onSelectConversation}
    />
  ))

  return <ConversationList items={items} />
}
