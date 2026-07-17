import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthScreenContainer } from '../features/auth/components/AuthScreen/AuthScreenContainer.tsx'
import { SessionRestoring } from '../features/auth/components/SessionRestoring/SessionRestoring.tsx'
import { useAuth } from '../features/auth/hooks/useAuth.ts'
import { ProfilePageContainer } from '../features/profile/components/ProfilePage/ProfilePageContainer.tsx'
import { ChatLayoutContainer } from './components/ChatLayout/ChatLayoutContainer.tsx'

function App(): React.ReactElement {
  const { isAuthenticated, isRestoringSession } = useAuth()

  if (isRestoringSession) {
    return <SessionRestoring />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <AuthScreenContainer />
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? <ChatLayoutContainer /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProfilePageContainer />
          ) : (
            <Navigate to="/login" replace />
          )
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
