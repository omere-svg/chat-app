import { Link } from 'react-router-dom'
import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { LOGIN_ROUTE } from '@/app/constants/routes.ts'
import { ResetPasswordForm } from './ResetPasswordForm.tsx'
import {
  RESET_PASSWORD_CLASS,
  RESET_PASSWORD_TEXT,
} from '../../ResetPasswordScreen.constants.ts'
import { useResetPasswordContext } from '../../context/useResetPasswordContext.tsx'

export function ResetPasswordFormContainer(): React.ReactElement {
  const {
    code,
    newPassword,
    setCode,
    setNewPassword,
    isSubmitting,
    errorMessage,
    canSubmit,
    submitLabel,
    handleSubmit,
  } = useResetPasswordContext()

  const errorNode = errorMessage ? <ErrorBanner message={errorMessage} /> : null

  const backToLoginLink = (
    <p className={RESET_PASSWORD_CLASS.footer}>
      <Link className={RESET_PASSWORD_CLASS.footerLink} to={LOGIN_ROUTE}>
        {RESET_PASSWORD_TEXT.backToLogin}
      </Link>
    </p>
  )

  return (
    <ResetPasswordForm
      code={code}
      newPassword={newPassword}
      areInputsDisabled={isSubmitting}
      isSubmitDisabled={!canSubmit || isSubmitting}
      submitLabel={submitLabel}
      errorMessage={errorNode}
      backToLoginLink={backToLoginLink}
      onCodeChange={setCode}
      onNewPasswordChange={setNewPassword}
      onSubmit={handleSubmit}
    />
  )
}
