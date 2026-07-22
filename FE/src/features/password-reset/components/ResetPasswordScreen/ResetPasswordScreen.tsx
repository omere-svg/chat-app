import { RESET_PASSWORD_CLASS } from './ResetPasswordScreen.constants.ts'
import type { ResetPasswordScreenProps } from './ResetPasswordScreen.types.ts'
import './ResetPasswordScreen.css'

export function ResetPasswordScreen({ children }: ResetPasswordScreenProps): React.ReactElement {
  return <main className={RESET_PASSWORD_CLASS.screen}>{children}</main>
}
