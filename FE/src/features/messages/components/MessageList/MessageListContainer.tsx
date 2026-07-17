import { MessageBubbleContainer } from '../MessageBubble/MessageBubbleContainer.tsx'
import { MessageList } from './MessageList.tsx'
import type { MessageListContainerProps } from './MessageList.types.ts'

export function MessageListContainer({
  messages,
  currentUserId,
}: MessageListContainerProps): React.ReactElement {
  const items = messages.map((message) => (
    <MessageBubbleContainer
      key={'clientMessageId' in message ? message.clientMessageId : message.id}
      message={message}
      isOwnMessage={message.senderId === currentUserId}
    />
  ))

  return <MessageList items={items} />
}
