import { Link } from 'react-router-dom'
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { LOGIN_ROUTE } from '@/app/constants/routes.ts'
import { ForgotPasswordScreen } from './ForgotPasswordScreen.tsx'
import { FORGOT_PASSWORD_CLASS, FORGOT_PASSWORD_TEXT } from './ForgotPasswordScreen.constants.ts'
import { useRequestPasswordReset } from './hooks/useRequestPasswordReset.ts'

export function ForgotPasswordScreenContainer(): React.ReactElement {
  const { email, setEmail, isSubmitting, errorMessage, canSubmit, submitLabel, handleSubmit } =
    useRequestPasswordReset()

  const errorNode = errorMessage ? <ErrorBanner message={errorMessage} /> : null

  const backToLoginLink = (
    <p className={FORGOT_PASSWORD_CLASS.footer}>
      <Link className={FORGOT_PASSWORD_CLASS.footerLink} to={LOGIN_ROUTE}>
        {FORGOT_PASSWORD_TEXT.backToLogin}
      </Link>
    </p>
  )

  return (
    <ForgotPasswordScreen
      email={email}
      areInputsDisabled={isSubmitting}
      isSubmitDisabled={!canSubmit || isSubmitting}
      submitLabel={submitLabel}
      errorMessage={errorNode}
      backToLoginLink={backToLoginLink}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
    />
  )
}
