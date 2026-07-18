import { useState } from 'react'
import { ConversationListContainer } from '@/features/conversations/components/ConversationList/ConversationListContainer.tsx'
import { NewConversationFormContainer } from '@/features/conversations/components/NewConversation/NewConversationFormContainer.tsx'
import { useConversations } from '@/features/conversations/hooks/useConversations.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { MessageThreadContainer } from '@/features/messages/components/MessageThread/MessageThreadContainer.tsx'
import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { fullName } from '@/types/domain.ts'
import { ChatLayout } from './ChatLayout.tsx'
import { ChatSidebar } from './components/ChatSidebar/ChatSidebar.tsx'
import { SidebarUserChipContainer } from './components/ChatSidebar/components/SidebarUserChip/SidebarUserChipContainer.tsx'
import { ChatTopbar } from './components/ChatTopbar/ChatTopbar.tsx'

export function ChatLayoutContainer(): React.ReactElement {
  const { currentUser, logout } = useAuth()
  const [userSelectedConversationId, setUserSelectedConversationId] = useState<
    string | null
  >(null)
  const { conversationsState, reloadConversations } = useConversations()

  const conversations =
    conversationsState.status === 'success'
      ? conversationsState.conversations
      : []

  const defaultConversationId =
    conversationsState.status === 'success'
      ? (conversationsState.conversations[0]?.id ?? null)
      : null

  const selectedConversationId =
    userSelectedConversationId ?? defaultConversationId

  function handleConversationCreated(conversationId: string): void {
    setUserSelectedConversationId(conversationId)
    reloadConversations({ quiet: true })
  }

  return (
    <ChatLayout
      topbar={
        <ChatTopbar
          userName={currentUser ? fullName(currentUser) : ''}
          avatar={
            currentUser ? (
              <UserAvatarContainer
                name={fullName(currentUser)}
                imageUrl={currentUser.avatarUrl}
                size="sm"
              />
            ) : null
          }
          onLogout={logout}
        />
      }
      sidebar={
        <ChatSidebar
          newConversation={
            <NewConversationFormContainer
              onConversationCreated={handleConversationCreated}
            />
          }
          conversationList={
            <ConversationListContainer
              conversationsState={conversationsState}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setUserSelectedConversationId}
              onRetryLoad={reloadConversations}
            />
          }
          userChip={<SidebarUserChipContainer />}
        />
      }
      main={
        <MessageThreadContainer
          selectedConversationId={selectedConversationId}
          conversations={conversations}
          onMessageSendSuccess={() => reloadConversations({ quiet: true })}
        />
      }
    />
  )
}
