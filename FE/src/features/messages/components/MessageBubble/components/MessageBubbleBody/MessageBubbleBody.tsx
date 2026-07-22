import { useMessageBubbleContext } from '../../context/useMessageBubbleContext.tsx'
import { MESSAGE_BUBBLE_BODY_CLASS } from './MessageBubbleBody.constants.ts'

export function MessageBubbleBody(): React.ReactElement {
  const { body, showCursor } = useMessageBubbleContext()

  return (
    <p className={MESSAGE_BUBBLE_BODY_CLASS.body}>
      {body}
      {showCursor ? (
        <span className={MESSAGE_BUBBLE_BODY_CLASS.cursor} aria-hidden="true" />
      ) : null}
    </p>
  )
}
