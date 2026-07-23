import { MessageComposer } from '../../../MessageComposer/MessageComposer.tsx'
import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'

export function MessageThreadComposerContainer(): React.ReactElement | null {
  const { isReady } = useMessageThreadContext()

  if (!isReady) {
    return null
  }

  return <MessageComposer />
}
