import { createContext, useContext } from 'react'
import { useMessageThreadScreen } from '../hooks/useMessageThreadScreen.ts'
import type { MessageThreadProviderProps } from '../MessageThread.types.ts'
import type { UseMessageThreadScreenValue } from './useMessageThreadContext.types.ts'

const MessageThreadContext = createContext<UseMessageThreadScreenValue | null>(null)

export function MessageThreadProvider({
  children,
}: MessageThreadProviderProps): React.ReactElement {
  const value = useMessageThreadScreen()

  return (
    <MessageThreadContext.Provider value={value}>{children}</MessageThreadContext.Provider>
  )
}

export function useMessageThreadContext(): UseMessageThreadScreenValue {
  const context = useContext(MessageThreadContext)
  if (context === null) {
    throw new Error('useMessageThreadContext must be used within a MessageThreadProvider')
  }
  return context
}
