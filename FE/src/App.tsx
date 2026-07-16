import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthScreenContainer } from './features/auth/AuthScreen.container.tsx'
import { ProfilePageContainer } from './features/profile/ProfilePage.container.tsx'
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

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthScreenContainer />}
      />
      <Route
        path="/chat"
        element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfilePageContainer /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
