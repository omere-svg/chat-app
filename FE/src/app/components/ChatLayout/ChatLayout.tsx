import { MessageThreadContainer } from '@/features/messages/components/MessageThread/MessageThreadContainer.tsx'
import { CHAT_LAYOUT_CLASS } from './ChatLayout.constants.ts'
import { ChatSidebarContainer } from './components/ChatSidebar/ChatSidebarContainer.tsx'
import { ChatTopbarContainer } from './components/ChatTopbar/ChatTopbarContainer.tsx'
import './ChatLayout.css'

export function ChatLayout(): React.ReactElement {
  return (
    <div className={CHAT_LAYOUT_CLASS.layout}>
      <ChatTopbarContainer />
      <div className={CHAT_LAYOUT_CLASS.panels}>
        <ChatSidebarContainer />
        <main className={CHAT_LAYOUT_CLASS.main}>
          <MessageThreadContainer />
        </main>
      </div>
    </div>
  )
}
