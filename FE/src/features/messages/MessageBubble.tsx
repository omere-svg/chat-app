import type { Message, PendingMessage } from '../../types/domain.ts'

type MessageBubbleProps = {
  message: Message | PendingMessage
  isOwnMessage: boolean
}

function isPendingMessage(
  message: Message | PendingMessage,
): message is PendingMessage {
  return 'clientMessageId' in message
}

export function MessageBubble({
  message,
  isOwnMessage,
}: MessageBubbleProps): React.ReactElement {
  const isPending = isPendingMessage(message)

  return (
    <div
      className={`message-bubble${isOwnMessage ? ' message-bubble--own' : ''}${isPending ? ' message-bubble--pending' : ''}`}
      data-testid="message-bubble"
    >
      <p className="message-bubble__body">{message.body}</p>
      {isPending ? (
        <span className="message-bubble__status">Sending…</span>
      ) : null}
    </div>
  )
}
