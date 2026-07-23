import { MessageBubbleProvider } from './context/useMessageBubbleContext.tsx'
import { MessageBubble } from './MessageBubble.tsx'
import type { MessageBubbleContainerProps } from './MessageBubble.types.ts'

export function MessageBubbleContainer({
  message,
}: MessageBubbleContainerProps): React.ReactElement {
  return (
    <MessageBubbleProvider message={message}>
      <MessageBubble />
    </MessageBubbleProvider>
  )
}
