import { ConversationListContainer } from '@/features/conversations/components/ConversationList/ConversationListContainer.tsx'
import { NewConversationFormContainer } from '@/features/conversations/components/NewConversation/NewConversationFormContainer.tsx'
import { useChatLayout } from '../../context/useChatLayoutContext.tsx'
import { ChatSidebar } from './ChatSidebar.tsx'
import { SidebarUserChipContainer } from './components/SidebarUserChip/SidebarUserChipContainer.tsx'

export function ChatSidebarContainer(): React.ReactElement {
  const {
    conversationsState,
    selectedConversationId,
    selectConversation,
    reloadConversations,
    handleConversationCreated,
  } = useChatLayout()

  return (
    <ChatSidebar
      newConversation={
        <NewConversationFormContainer onConversationCreated={handleConversationCreated} />
      }
      conversationList={
        <ConversationListContainer
          conversationsState={conversationsState}
          selectedConversationId={selectedConversationId}
          onSelectConversation={selectConversation}
          onRetryLoad={reloadConversations}
        />
      }
      userChip={<SidebarUserChipContainer />}
    />
  )
}
