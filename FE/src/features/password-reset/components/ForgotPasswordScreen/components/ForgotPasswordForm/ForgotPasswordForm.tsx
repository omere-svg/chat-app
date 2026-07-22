import { FORGOT_PASSWORD_CLASS } from '../../ForgotPasswordScreen.constants.ts'
import { useForgotPasswordContext } from '../../context/useForgotPasswordContext.tsx'
import { ForgotPasswordIntro } from './components/ForgotPasswordIntro/ForgotPasswordIntro.tsx'
import { ForgotPasswordEmailField } from './components/ForgotPasswordEmailField/ForgotPasswordEmailField.tsx'
import { ForgotPasswordError } from './components/ForgotPasswordError/ForgotPasswordError.tsx'
import { ForgotPasswordSubmit } from './components/ForgotPasswordSubmit/ForgotPasswordSubmit.tsx'
import { ForgotPasswordFooter } from './components/ForgotPasswordFooter/ForgotPasswordFooter.tsx'

export function ForgotPasswordForm(): React.ReactElement {
  const { handleSubmit } = useForgotPasswordContext()

  return (
    <form className={FORGOT_PASSWORD_CLASS.form} noValidate onSubmit={handleSubmit}>
      <ForgotPasswordIntro />
      <ForgotPasswordEmailField />
      <ForgotPasswordError />
      <ForgotPasswordSubmit />
      <ForgotPasswordFooter />
    </form>
  )
}
