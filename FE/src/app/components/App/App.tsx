import { Route, Routes } from 'react-router-dom'
import { AuthScreenContainer } from '@/features/auth/components/AuthScreen/AuthScreenContainer.tsx'
import { ProfilePageContainer } from '@/features/profile/components/ProfilePage/ProfilePageContainer.tsx'
import { EmailChangeConfirmScreenContainer } from '@/features/email-change/components/EmailChangeConfirmScreen/EmailChangeConfirmScreenContainer.tsx'
import { ForgotPasswordScreenContainer } from '@/features/password-reset/components/ForgotPasswordScreen/ForgotPasswordScreenContainer.tsx'
import { ResetPasswordScreenContainer } from '@/features/password-reset/components/ResetPasswordScreen/ResetPasswordScreenContainer.tsx'
import { SubscriptionCallbackScreenContainer } from '@/features/subscription/components/SubscriptionCallbackScreen/SubscriptionCallbackScreenContainer.tsx'
import { ChatLayoutContainer } from '@/app/components/ChatLayout/ChatLayoutContainer.tsx'
import {
  CHAT_ROUTE,
  CONFIRM_EMAIL_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  RESET_PASSWORD_ROUTE,
  SUBSCRIPTION_CALLBACK_ROUTE,
  WILDCARD_ROUTE,
} from '@/app/constants/routes.ts'
import { DefaultRedirect } from './components/DefaultRedirect/DefaultRedirect.tsx'
import { RedirectWhenAuthenticated } from './components/RedirectWhenAuthenticated/RedirectWhenAuthenticated.tsx'
import { RequireAuth } from './components/RequireAuth/RequireAuth.tsx'

export function App(): React.ReactElement {
  return (
    <Routes>
      <Route
        path={LOGIN_ROUTE}
        element={
          <RedirectWhenAuthenticated>
            <AuthScreenContainer />
          </RedirectWhenAuthenticated>
        }
      />
      <Route
        path={CHAT_ROUTE}
        element={
          <RequireAuth>
            <ChatLayoutContainer />
          </RequireAuth>
        }
      />
      <Route
        path={PROFILE_ROUTE}
        element={
          <RequireAuth>
            <ProfilePageContainer />
          </RequireAuth>
        }
      />
      <Route path={CONFIRM_EMAIL_ROUTE} element={<EmailChangeConfirmScreenContainer />} />
      <Route
        path={FORGOT_PASSWORD_ROUTE}
        element={
          <RedirectWhenAuthenticated>
            <ForgotPasswordScreenContainer />
          </RedirectWhenAuthenticated>
        }
      />
      <Route
        path={RESET_PASSWORD_ROUTE}
        element={
          <RedirectWhenAuthenticated>
            <ResetPasswordScreenContainer />
          </RedirectWhenAuthenticated>
        }
      />
      <Route
        path={SUBSCRIPTION_CALLBACK_ROUTE}
        element={
          <RequireAuth>
            <SubscriptionCallbackScreenContainer />
          </RequireAuth>
        }
      />
      <Route path={WILDCARD_ROUTE} element={<DefaultRedirect />} />
    </Routes>
  )
}
