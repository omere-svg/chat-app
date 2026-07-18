import { ChatLayout } from './ChatLayout.tsx'
import { ChatLayoutProvider } from './context/useChatLayoutContext.tsx'

export function ChatLayoutContainer(): React.ReactElement {
  return (
    <ChatLayoutProvider>
      <ChatLayout />
    </ChatLayoutProvider>
  )
}
