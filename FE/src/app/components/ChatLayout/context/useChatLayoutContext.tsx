import { createContext, useContext, useState } from 'react'
import { useConversations } from '@/features/conversations/hooks/useConversations.ts'
import type {
  ChatLayoutContextValue,
  ChatLayoutProviderProps,
} from '../ChatLayout.types.ts'

const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null)

export function ChatLayoutProvider({
  children,
}: ChatLayoutProviderProps): React.ReactElement {
  const [userSelectedConversationId, setUserSelectedConversationId] = useState<
    string | null
  >(null)
  const { conversationsState, reloadConversations } = useConversations()

  const conversations =
    conversationsState.status === 'success' ? conversationsState.conversations : []
  const defaultConversationId =
    conversationsState.status === 'success'
      ? (conversationsState.conversations[0]?.id ?? null)
      : null
  const selectedConversationId = userSelectedConversationId ?? defaultConversationId

  function handleConversationCreated(conversationId: string): void {
    setUserSelectedConversationId(conversationId)
    reloadConversations({ quiet: true })
  }

  const value: ChatLayoutContextValue = {
    conversationsState,
    conversations,
    selectedConversationId,
    selectConversation: setUserSelectedConversationId,
    reloadConversations,
    handleConversationCreated,
  }

  return <ChatLayoutContext.Provider value={value}>{children}</ChatLayoutContext.Provider>
}

export function useChatLayout(): ChatLayoutContextValue {
  const context = useContext(ChatLayoutContext)
  if (context === null) {
    throw new Error('useChatLayout must be used within a ChatLayoutProvider')
  }
  return context
}
