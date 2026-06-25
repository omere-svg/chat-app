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

function formatClockTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
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
      <span className="message-bubble__meta">
        {isPending ? (
          <span className="message-bubble__status">Sending…</span>
        ) : (
          <time className="message-bubble__time" dateTime={message.createdAt}>
            {formatClockTime(message.createdAt)}
          </time>
        )}
      </span>
    </div>
  )
}
