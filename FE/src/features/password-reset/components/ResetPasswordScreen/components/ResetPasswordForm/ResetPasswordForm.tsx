import { useResetPasswordContext } from '../../context/useResetPasswordContext.tsx'
import { RESET_PASSWORD_FORM_CLASS } from './ResetPasswordForm.constants.ts'
import { ResetPasswordFormHeader } from './components/ResetPasswordFormHeader/ResetPasswordFormHeader.tsx'
import { ResetPasswordCodeField } from './components/ResetPasswordCodeField/ResetPasswordCodeField.tsx'
import { ResetPasswordNewPasswordField } from './components/ResetPasswordNewPasswordField/ResetPasswordNewPasswordField.tsx'
import { ResetPasswordErrorContainer } from './components/ResetPasswordError/ResetPasswordErrorContainer.tsx'
import { ResetPasswordSubmit } from './components/ResetPasswordSubmit/ResetPasswordSubmit.tsx'
import { ResetPasswordFooter } from './components/ResetPasswordFooter/ResetPasswordFooter.tsx'
import './ResetPasswordForm.css'

export function ResetPasswordForm(): React.ReactElement {
  const { handleSubmit } = useResetPasswordContext()

  return (
    <form className={RESET_PASSWORD_FORM_CLASS.form} noValidate onSubmit={handleSubmit}>
      <ResetPasswordFormHeader />
      <ResetPasswordCodeField />
      <ResetPasswordNewPasswordField />
      <ResetPasswordErrorContainer />
      <ResetPasswordSubmit />
      <ResetPasswordFooter />
    </form>
  )
}
