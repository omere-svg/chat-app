import { ConversationListContainer } from '@/features/conversations/components/ConversationList/ConversationListContainer.tsx'
import { NewConversationContainer } from '@/features/conversations/components/NewConversation/NewConversationContainer.tsx'
import { CHAT_SIDEBAR_CLASS, CHAT_SIDEBAR_TEXT } from './ChatSidebar.constants.ts'
import { SidebarUserChipContainer } from './components/SidebarUserChip/SidebarUserChipContainer.tsx'
import './ChatSidebar.css'

export function ChatSidebar(): React.ReactElement {
  return (
    <aside className={CHAT_SIDEBAR_CLASS.sidebar}>
      <h2 className={CHAT_SIDEBAR_CLASS.title}>{CHAT_SIDEBAR_TEXT.title}</h2>
      <NewConversationContainer />
      <ConversationListContainer />
      <SidebarUserChipContainer />
    </aside>
  )
}
