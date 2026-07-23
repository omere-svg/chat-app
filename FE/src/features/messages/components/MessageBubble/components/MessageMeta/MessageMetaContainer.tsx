import { useMessageBubbleContext } from '../../context/useMessageBubbleContext.tsx'
import { MessageMeta } from './MessageMeta.tsx'
import { MessageMetaStatus } from './components/MessageMetaStatus/MessageMetaStatus.tsx'
import { MessageMetaTime } from './components/MessageMetaTime/MessageMetaTime.tsx'

export function MessageMetaContainer(): React.ReactElement {
  const { isPending, isStreaming } = useMessageBubbleContext()

  if (isPending || isStreaming) {
    return (
      <MessageMeta>
        <MessageMetaStatus />
      </MessageMeta>
    )
  }

  return (
    <MessageMeta>
      <MessageMetaTime />
    </MessageMeta>
  )
}
