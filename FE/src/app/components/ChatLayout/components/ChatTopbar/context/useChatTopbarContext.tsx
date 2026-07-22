import { createContext, useContext } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { fullName } from '@/types/domain.ts'
import type {
  ChatTopbarContextValue,
  ChatTopbarProviderProps,
} from './useChatTopbarContext.types.ts'

const ChatTopbarContext = createContext<ChatTopbarContextValue | null>(null)

export function ChatTopbarProvider({
  children,
}: ChatTopbarProviderProps): React.ReactElement {
  const { currentUser, logout } = useAuth()

  const value: ChatTopbarContextValue = {
    userName: currentUser ? fullName(currentUser) : '',
    avatarUrl: currentUser?.avatarUrl ?? null,
    logout,
  }

  return <ChatTopbarContext.Provider value={value}>{children}</ChatTopbarContext.Provider>
}

export function useChatTopbar(): ChatTopbarContextValue {
  const context = useContext(ChatTopbarContext)
  if (context === null) {
    throw new Error('useChatTopbar must be used within a ChatTopbarProvider')
  }
  return context
}
