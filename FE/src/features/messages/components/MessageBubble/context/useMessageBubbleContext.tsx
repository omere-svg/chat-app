import { createContext, useContext } from 'react'
import { useMessageBubble } from '../hooks/useMessageBubble.ts'
import type { MessageBubbleProviderProps } from '../MessageBubble.types.ts'
import type { MessageBubbleContextValue } from './useMessageBubbleContext.types.ts'

const MessageBubbleContext = createContext<MessageBubbleContextValue | null>(null)

export function MessageBubbleProvider({
  message,
  children,
}: MessageBubbleProviderProps): React.ReactElement {
  const value = useMessageBubble(message)

  return (
    <MessageBubbleContext.Provider value={value}>
      {children}
    </MessageBubbleContext.Provider>
  )
}

export function useMessageBubbleContext(): MessageBubbleContextValue {
  const context = useContext(MessageBubbleContext)
  if (context === null) {
    throw new Error('useMessageBubbleContext must be used within a MessageBubbleProvider')
  }
  return context
}
