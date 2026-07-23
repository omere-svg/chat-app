import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useChatLayout } from '@/app/components/ChatLayout/context/useChatLayoutContext.tsx'
import { ConversationEmptyState } from '../ConversationEmptyState/ConversationEmptyState.tsx'
import { ConversationListItemContainer } from '../ConversationListItem/ConversationListItemContainer.tsx'
import { ConversationListSkeletonContainer } from '../ConversationListSkeleton/ConversationListSkeletonContainer.tsx'
import { ConversationList } from './ConversationList.tsx'

export function ConversationListContainer(): React.ReactElement {
  const { conversationsState, reloadConversations } = useChatLayout()

  if (conversationsState.status === 'loading') {
    return <ConversationListSkeletonContainer />
  }

  if (conversationsState.status === 'error') {
    return <ErrorBanner message={conversationsState.message} onRetry={reloadConversations} />
  }

  if (conversationsState.status === 'empty') {
    return <ConversationEmptyState />
  }

  const items = conversationsState.conversations.map((conversation) => (
    <ConversationListItemContainer key={conversation.id} conversation={conversation} />
  ))

  return <ConversationList>{items}</ConversationList>
}
