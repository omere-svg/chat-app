import { MessageCitationsContainer } from '../MessageCitations/MessageCitationsContainer.tsx'
import { MessageMetaContainer } from './components/MessageMeta/MessageMetaContainer.tsx'
import { MessageToolsContainer } from './components/MessageTools/MessageToolsContainer.tsx'
import { MessageBubble } from './MessageBubble.tsx'
import type { MessageBubbleContainerProps } from './MessageBubble.types.ts'
import {
  extractCitations,
  isPendingMessage,
  isStreamingMessage,
  messageBubbleClassName,
} from './MessageBubble.utils.ts'

export function MessageBubbleContainer({
  message,
  isOwnMessage,
}: MessageBubbleContainerProps): React.ReactElement {
  const isPending = isPendingMessage(message)
  const streaming = isStreamingMessage(message) ? message : null
  const tools = streaming?.annotations?.tools ?? []
  const completedTools = streaming?.annotations?.completedTools ?? []
  const citations = extractCitations(message, streaming)

  const toolsNode =
    tools.length > 0 ? (
      <MessageToolsContainer tools={tools} completedTools={completedTools} />
    ) : null

  const citationsNode =
    citations.length > 0 ? (
      <MessageCitationsContainer citations={citations} />
    ) : null

  return (
    <MessageBubble
      className={messageBubbleClassName(
        isOwnMessage,
        isPending,
        streaming !== null,
      )}
      body={message.body}
      showCursor={streaming !== null}
      tools={toolsNode}
      citations={citationsNode}
      meta={
        <MessageMetaContainer
          isPending={isPending}
          isStreaming={streaming !== null}
          body={message.body}
          createdAt={message.createdAt}
        />
      }
    />
  )
}
