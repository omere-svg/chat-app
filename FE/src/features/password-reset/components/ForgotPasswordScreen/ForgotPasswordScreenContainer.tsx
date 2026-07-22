import { ForgotPasswordScreen } from './ForgotPasswordScreen.tsx'
import { ForgotPasswordForm } from './components/ForgotPasswordForm/ForgotPasswordForm.tsx'
import { ForgotPasswordProvider } from './context/useForgotPasswordContext.tsx'

export function ForgotPasswordScreenContainer(): React.ReactElement {
  return (
    <ForgotPasswordProvider>
      <ForgotPasswordScreen>
        <ForgotPasswordForm />
      </ForgotPasswordScreen>
    </ForgotPasswordProvider>
  )
}
