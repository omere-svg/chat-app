import { FORGOT_PASSWORD_CLASS } from './ForgotPasswordScreen.constants.ts'
import type { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types.ts'
import './ForgotPasswordScreen.css'

export function ForgotPasswordScreen({ children }: ForgotPasswordScreenProps): React.ReactElement {
  return <main className={FORGOT_PASSWORD_CLASS.screen}>{children}</main>
}
