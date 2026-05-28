import { AuthScreenContainer } from './features/auth/AuthScreen.container.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { ChatLayout } from './layouts/ChatLayout.tsx'
import './styles/chat.css'

function App(): React.ReactElement {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <ChatLayout /> : <AuthScreenContainer />
}

export default App
