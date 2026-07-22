import { ConversationListContainer } from '@/features/conversations/components/ConversationList/ConversationListContainer.tsx'
import { NewConversationFormContainer } from '@/features/conversations/components/NewConversation/NewConversationFormContainer.tsx'
import { ChatSidebar } from './ChatSidebar.tsx'
import { SidebarUserChipContainer } from './components/SidebarUserChip/SidebarUserChipContainer.tsx'

export function ChatSidebarContainer(): React.ReactElement {
  return (
    <ChatSidebar
      newConversation={<NewConversationFormContainer />}
      conversationList={<ConversationListContainer />}
      userChip={<SidebarUserChipContainer />}
    />
  )
}
