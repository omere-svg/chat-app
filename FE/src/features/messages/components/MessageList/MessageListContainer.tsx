import { MessageBubbleContainer } from '../MessageBubble/MessageBubbleContainer.tsx'
import { MessageList } from './MessageList.tsx'
import type { MessageListContainerProps } from './MessageList.types.ts'

export function MessageListContainer({
  messages,
}: MessageListContainerProps): React.ReactElement {
  const items = messages.map((message) => (
    <MessageBubbleContainer
      key={'clientMessageId' in message ? message.clientMessageId : message.id}
      message={message}
    />
  ))

  return <MessageList items={items} />
}
