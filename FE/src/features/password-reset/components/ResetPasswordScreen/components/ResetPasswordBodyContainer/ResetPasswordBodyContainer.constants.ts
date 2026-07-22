import { ResetPasswordFormContainer } from '../ResetPasswordForm/ResetPasswordFormContainer.tsx'
import { ResetPasswordSuccess } from '../ResetPasswordSuccess/ResetPasswordSuccess.tsx'
import type { ResetPasswordStatus } from '../../ResetPasswordScreen.types.ts'

export const RESET_PASSWORD_BODY: Record<ResetPasswordStatus, () => React.ReactElement> = {
  editing: ResetPasswordFormContainer,
  success: ResetPasswordSuccess,
}
