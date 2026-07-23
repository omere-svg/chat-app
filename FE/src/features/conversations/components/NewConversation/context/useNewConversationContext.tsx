import { createContext, useContext } from 'react'
import { useChatLayout } from '@/app/components/ChatLayout/context/useChatLayoutContext.tsx'
import { useNewConversation } from '../hooks/useNewConversation.ts'
import type {
  NewConversationProviderProps,
  UseNewConversationValue,
} from '../NewConversation.types.ts'

const NewConversationContext = createContext<UseNewConversationValue | null>(null)

export function NewConversationProvider({
  children,
}: NewConversationProviderProps): React.ReactElement {
  const { selectCreatedConversation } = useChatLayout()
  const value = useNewConversation(selectCreatedConversation)

  return (
    <NewConversationContext.Provider value={value}>
      {children}
    </NewConversationContext.Provider>
  )
}

export function useNewConversationContext(): UseNewConversationValue {
  const context = useContext(NewConversationContext)
  if (context === null) {
    throw new Error('useNewConversationContext must be used within a NewConversationProvider')
  }
  return context
}
