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

// Turns a raw tool name into a user-facing progress phrase. Falls back gracefully so a
// tool added on the backend still renders something sensible before the FE knows it.
function friendlyToolLabel(toolName: string): string {
  switch (toolName) {
    case 'retrieve_knowledge':
      return 'Searching your documents'
    case 'search_my_messages':
      return 'Looking up your messages'
    case 'list_my_conversations':
      return 'Reviewing your conversations'
    default:
      return `Using ${toolName}`
  }
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
  const completedTools = streaming?.annotations?.completedTools ?? []
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
        <ul className="message-bubble__tools" aria-label="Agent progress">
          {tools.map((tool, index) => {
            // The k-th run of a tool is done once k completions for that name arrived.
            const priorSameName = tools.slice(0, index).filter((name) => name === tool).length
            const isDone = priorSameName < completedTools.filter((name) => name === tool).length
            return (
              <li
                key={`${tool}-${index.toString()}`}
                className={`message-bubble__tool${isDone ? ' message-bubble__tool--done' : ''}`}
              >
                {friendlyToolLabel(tool)}
                {isDone ? '' : '…'}
              </li>
            )
          })}
        </ul>
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
