import { ResetPasswordScreen } from './ResetPasswordScreen.tsx'
import { ResetPasswordBodyContainer } from './components/ResetPasswordBodyContainer/ResetPasswordBodyContainer.tsx'
import { ResetPasswordProvider } from './context/useResetPasswordContext.tsx'

export function ResetPasswordScreenContainer(): React.ReactElement {
  return (
    <ResetPasswordProvider>
      <ResetPasswordScreen>
        <ResetPasswordBodyContainer />
      </ResetPasswordScreen>
    </ResetPasswordProvider>
  )
}
