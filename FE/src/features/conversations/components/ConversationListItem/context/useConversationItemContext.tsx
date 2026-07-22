import { createContext, useContext } from 'react'
import { useChatLayout } from '@/app/components/ChatLayout/context/useChatLayoutContext.tsx'
import { CONVERSATION_ITEM_TEXT } from '../ConversationListItem.constants.ts'
import {
  badgeLabelForType,
  conversationItemClassName,
} from '../ConversationListItem.utils.ts'
import type {
  ConversationItemContextValue,
  ConversationItemProviderProps,
} from './useConversationItemContext.types.ts'

const ConversationItemContext = createContext<ConversationItemContextValue | null>(null)

export function ConversationItemProvider({
  conversation,
  children,
}: ConversationItemProviderProps): React.ReactElement {
  const { selectedConversationId, selectConversation } = useChatLayout()
  const isSelected = conversation.id === selectedConversationId

  const value: ConversationItemContextValue = {
    title: conversation.title,
    preview: conversation.lastMessage?.body ?? CONVERSATION_ITEM_TEXT.emptyPreview,
    badgeLabel: badgeLabelForType(conversation.type),
    isSelected,
    className: conversationItemClassName(isSelected),
    onSelect: () => selectConversation(conversation.id),
  }

  return (
    <ConversationItemContext.Provider value={value}>
      {children}
    </ConversationItemContext.Provider>
  )
}

export function useConversationItemContext(): ConversationItemContextValue {
  const context = useContext(ConversationItemContext)
  if (context === null) {
    throw new Error(
      'useConversationItemContext must be used within a ConversationItemProvider',
    )
  }
  return context
}
