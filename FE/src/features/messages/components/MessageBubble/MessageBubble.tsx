import { MESSAGE_BUBBLE_CLASS } from './MessageBubble.constants.ts'
import type { MessageBubbleProps } from './MessageBubble.types.ts'
import './MessageBubble.css'

export function MessageBubble({
  className,
  body,
  showCursor,
  tools,
  citations,
  meta,
}: MessageBubbleProps): React.ReactElement {
  return (
    <div className={className} data-testid="message-bubble">
      {tools}
      <p className={MESSAGE_BUBBLE_CLASS.body}>
        {body}
        {showCursor ? (
          <span className={MESSAGE_BUBBLE_CLASS.cursor} aria-hidden="true" />
        ) : null}
      </p>
      {citations}
      {meta}
    </div>
  )
}
