import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthScreenContainer } from '../features/auth/components/AuthScreen/AuthScreenContainer.tsx'
import { SessionRestoring } from '../features/auth/components/SessionRestoring/SessionRestoring.tsx'
import { useAuth } from '../features/auth/hooks/useAuth.ts'
import { ProfilePageContainer } from '../features/profile/components/ProfilePage/ProfilePageContainer.tsx'
import { EmailChangeConfirmScreenContainer } from '../features/email-change/components/EmailChangeConfirmScreen/EmailChangeConfirmScreenContainer.tsx'
import { ForgotPasswordScreenContainer } from '../features/password-reset/components/ForgotPasswordScreen/ForgotPasswordScreenContainer.tsx'
import { ResetPasswordScreenContainer } from '../features/password-reset/components/ResetPasswordScreen/ResetPasswordScreenContainer.tsx'
import { ChatLayoutContainer } from './components/ChatLayout/ChatLayoutContainer.tsx'
import {
  CHAT_ROUTE,
  CONFIRM_EMAIL_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  RESET_PASSWORD_ROUTE,
} from './constants/routes.ts'

function App(): React.ReactElement {
  const { isAuthenticated, isRestoringSession } = useAuth()

  if (isRestoringSession) {
    return <SessionRestoring />
  }

  return (
    <Routes>
      <Route
        path={LOGIN_ROUTE}
        element={
          isAuthenticated ? <Navigate to={CHAT_ROUTE} replace /> : <AuthScreenContainer />
        }
      />
      <Route
        path={CHAT_ROUTE}
        element={
          isAuthenticated ? <ChatLayoutContainer /> : <Navigate to={LOGIN_ROUTE} replace />
        }
      />
      <Route
        path={PROFILE_ROUTE}
        element={
          isAuthenticated ? (
            <ProfilePageContainer />
          ) : (
            <Navigate to={LOGIN_ROUTE} replace />
          )
        }
      />
      <Route path={CONFIRM_EMAIL_ROUTE} element={<EmailChangeConfirmScreenContainer />} />
      <Route
        path={FORGOT_PASSWORD_ROUTE}
        element={
          isAuthenticated ? <Navigate to={CHAT_ROUTE} replace /> : <ForgotPasswordScreenContainer />
        }
      />
      <Route
        path={RESET_PASSWORD_ROUTE}
        element={
          isAuthenticated ? <Navigate to={CHAT_ROUTE} replace /> : <ResetPasswordScreenContainer />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? CHAT_ROUTE : LOGIN_ROUTE} replace />}
      />
    </Routes>
  )
}

export default App
