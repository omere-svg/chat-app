import {
  CHAT_SIDEBAR_CLASS,
  CHAT_SIDEBAR_TEXT,
} from './ChatSidebar.constants.ts'
import type { ChatSidebarProps } from './ChatSidebar.types.ts'
import './ChatSidebar.css'

export function ChatSidebar({
  newConversation,
  conversationList,
  userChip,
}: ChatSidebarProps): React.ReactElement {
  return (
    <aside className={CHAT_SIDEBAR_CLASS.sidebar}>
      <h2 className={CHAT_SIDEBAR_CLASS.title}>{CHAT_SIDEBAR_TEXT.title}</h2>
      {newConversation}
      {conversationList}
      {userChip}
    </aside>
  )
}
