import { MESSAGE_META_TEXT } from './MessageMeta.constants.ts'
import { MessageMeta } from './MessageMeta.tsx'
import type { MessageMetaContainerProps } from './MessageMeta.types.ts'
import { formatClockTime } from './MessageMeta.utils.ts'

export function MessageMetaContainer({
  isPending,
  isStreaming,
  body,
  createdAt,
}: MessageMetaContainerProps): React.ReactElement {
  if (isPending) {
    return <MessageMeta variant="pending" label={MESSAGE_META_TEXT.pending} />
  }

  if (isStreaming) {
    return (
      <MessageMeta
        variant="streaming"
        label={body.length === 0 ? MESSAGE_META_TEXT.thinking : MESSAGE_META_TEXT.typing}
      />
    )
  }

  return (
    <MessageMeta
      variant="sent"
      label={formatClockTime(createdAt)}
      dateTime={createdAt}
    />
  )
}
