import { AuthScreenContainer } from './features/auth/AuthScreen.container.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { ChatLayout } from './layouts/ChatLayout.tsx'
import './styles/chat.css'

function App(): React.ReactElement {
  const { isAuthenticated, isRestoringSession } = useAuth()

  if (isRestoringSession) {
    return (
      <div className="auth-screen" role="status" aria-live="polite">
        <p className="auth-screen__subtitle">Restoring your session…</p>
      </div>
    )
  }

  return isAuthenticated ? <ChatLayout /> : <AuthScreenContainer />
}

export default App
