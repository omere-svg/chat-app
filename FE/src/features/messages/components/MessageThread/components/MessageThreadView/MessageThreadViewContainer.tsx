import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'
import { MessageThread } from '../../MessageThread.tsx'
import { MessageThreadPlaceholder } from '../MessageThreadPlaceholder/MessageThreadPlaceholder.tsx'

export function MessageThreadViewContainer(): React.ReactElement {
  const { threadState } = useMessageThreadContext()

  if (threadState.status === 'idle') {
    return <MessageThreadPlaceholder />
  }

  return <MessageThread />
}
