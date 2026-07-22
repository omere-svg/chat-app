import { MessageThreadViewContainer } from './components/MessageThreadView/MessageThreadViewContainer.tsx'
import { MessageThreadProvider } from './context/useMessageThreadContext.tsx'

export function MessageThreadContainer(): React.ReactElement {
  return (
    <MessageThreadProvider>
      <MessageThreadViewContainer />
    </MessageThreadProvider>
  )
}
