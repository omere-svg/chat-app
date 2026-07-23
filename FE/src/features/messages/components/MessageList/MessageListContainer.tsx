import { useMessageThreadContext } from '../MessageThread/context/useMessageThreadContext.tsx'
import { MessageBubbleContainer } from '../MessageBubble/MessageBubbleContainer.tsx'
import { MessageList } from './MessageList.tsx'

export function MessageListContainer(): React.ReactElement {
  const { threadMessages } = useMessageThreadContext()

  const items = threadMessages.map((message) => (
    <MessageBubbleContainer
      key={'clientMessageId' in message ? message.clientMessageId : message.id}
      message={message}
    />
  ))

  return <MessageList>{items}</MessageList>
}
