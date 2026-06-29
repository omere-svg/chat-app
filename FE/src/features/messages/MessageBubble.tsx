import { MessageCitations } from './MessageCitations.tsx'
import type { Citation, PendingMessage, StreamingMessage, ThreadMessage } from '../../types/domain.ts'

type MessageBubbleProps = {
  message: ThreadMessage
  isOwnMessage: boolean
}

function isPendingMessage(message: ThreadMessage): message is PendingMessage {
  return 'clientMessageId' in message
}

function isStreamingMessage(message: ThreadMessage): message is StreamingMessage {
  return 'status' in message
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
  const streaming = isStreamingMessage(message) ? message : null
  const tools = streaming?.annotations?.tools ?? []
  // Citations stream into annotations live, then arrive on the persisted message's
  // metadata once done — render from whichever is present.
  const citations: Citation[] = streaming
    ? (streaming.annotations?.citations ?? [])
    : (message.metadata?.citations ?? [])

  return (
    <div
      className={[
        'message-bubble',
        isOwnMessage ? 'message-bubble--own' : '',
        isPending ? 'message-bubble--pending' : '',
        streaming ? 'message-bubble--streaming' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid="message-bubble"
    >
      {tools.length > 0 ? (
        <span className="message-bubble__tools">Using {tools.join(', ')}…</span>
      ) : null}
      <p className="message-bubble__body">
        {message.body}
        {streaming ? <span className="message-bubble__cursor" aria-hidden="true" /> : null}
      </p>
      {citations.length > 0 ? <MessageCitations citations={citations} /> : null}
      <span className="message-bubble__meta">
        {isPending ? (
          <span className="message-bubble__status">Sending…</span>
        ) : streaming ? (
          <span className="message-bubble__status" role="status">
            {message.body.length === 0 ? 'Assistant is thinking…' : 'Typing…'}
          </span>
        ) : (
          <time className="message-bubble__time" dateTime={message.createdAt}>
            {formatClockTime(message.createdAt)}
          </time>
        )}
      </span>
    </div>
  )
}
