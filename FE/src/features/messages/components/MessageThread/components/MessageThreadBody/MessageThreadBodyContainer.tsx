import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { SendersProvider } from '@/features/messages/context/useSendersContext.tsx'
import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'
import { MessageListContainer } from '../../../MessageList/MessageListContainer.tsx'
import { MessageThreadSkeletonContainer } from '../../../MessageThreadSkeleton/MessageThreadSkeletonContainer.tsx'
import { LoadMoreButton } from '../LoadMoreButton/LoadMoreButton.tsx'
import { MessageThreadEmpty } from '../MessageThreadEmpty/MessageThreadEmpty.tsx'

export function MessageThreadBodyContainer(): React.ReactElement {
  const {
    threadState,
    senders,
    hasMoreOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
    loadOlderMessagesError,
    refetchMessages,
  } = useMessageThreadContext()

  const loadMore =
    hasMoreOlderMessages && threadState.status === 'success' ? (
      <LoadMoreButton loading={isLoadingOlderMessages} onClick={loadOlderMessages} />
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
      <SendersProvider senders={senders}>
        <MessageListContainer />
      </SendersProvider>
    )

  return (
    <>
      {loadMore}
      {loadError}
      {statusContent}
    </>
  )
}
