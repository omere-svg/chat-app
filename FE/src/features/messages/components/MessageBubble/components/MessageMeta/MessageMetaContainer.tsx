import { useMessageBubbleContext } from '../../context/useMessageBubbleContext.tsx'
import { MESSAGE_META_TEXT } from './MessageMeta.constants.ts'
import { MessageMeta } from './MessageMeta.tsx'
import { MessageMetaStatus } from './components/MessageMetaStatus/MessageMetaStatus.tsx'
import { MessageMetaTime } from './components/MessageMetaTime/MessageMetaTime.tsx'
import { formatClockTime } from './MessageMeta.utils.ts'

export function MessageMetaContainer(): React.ReactElement {
  const { isPending, isStreaming, body, createdAt } = useMessageBubbleContext()

  if (isPending) {
    return (
      <MessageMeta>
        <MessageMetaStatus label={MESSAGE_META_TEXT.pending} isLive={false} />
      </MessageMeta>
    )
  }

  if (isStreaming) {
    const streamingLabel =
      body.length === 0 ? MESSAGE_META_TEXT.thinking : MESSAGE_META_TEXT.typing
    return (
      <MessageMeta>
        <MessageMetaStatus label={streamingLabel} isLive={true} />
      </MessageMeta>
    )
  }

  return (
    <MessageMeta>
      <MessageMetaTime label={formatClockTime(createdAt)} dateTime={createdAt} />
    </MessageMeta>
  )
}
