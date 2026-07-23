import { FORGOT_PASSWORD_FORM_CLASS } from './ForgotPasswordForm.constants.ts'
import { useForgotPasswordContext } from '../../context/useForgotPasswordContext.tsx'
import { ForgotPasswordIntro } from './components/ForgotPasswordIntro/ForgotPasswordIntro.tsx'
import { ForgotPasswordEmailField } from './components/ForgotPasswordEmailField/ForgotPasswordEmailField.tsx'
import { ForgotPasswordErrorContainer } from './components/ForgotPasswordError/ForgotPasswordErrorContainer.tsx'
import { ForgotPasswordSubmit } from './components/ForgotPasswordSubmit/ForgotPasswordSubmit.tsx'
import { ForgotPasswordFooter } from './components/ForgotPasswordFooter/ForgotPasswordFooter.tsx'

export function ForgotPasswordForm(): React.ReactElement {
  const { handleSubmit } = useForgotPasswordContext()

  return (
    <form className={FORGOT_PASSWORD_FORM_CLASS.form} noValidate onSubmit={handleSubmit}>
      <ForgotPasswordIntro />
      <ForgotPasswordEmailField />
      <ForgotPasswordErrorContainer />
      <ForgotPasswordSubmit />
      <ForgotPasswordFooter />
    </form>
  )
}
