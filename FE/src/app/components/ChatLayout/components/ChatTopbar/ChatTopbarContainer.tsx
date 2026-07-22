import { ChatTopbar } from './ChatTopbar.tsx'
import { ChatTopbarProvider } from './context/useChatTopbarContext.tsx'

export function ChatTopbarContainer(): React.ReactElement {
  return (
    <ChatTopbarProvider>
      <ChatTopbar />
    </ChatTopbarProvider>
  )
}
