import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'
import { MessageThreadHeader } from './MessageThreadHeader.tsx'

export function MessageThreadHeaderContainer(): React.ReactElement | null {
  const { conversationTitle } = useMessageThreadContext()

  if (!conversationTitle) {
    return null
  }

  return <MessageThreadHeader title={conversationTitle} />
}
