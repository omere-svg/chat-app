import { Button } from '@/shared/components/Button/Button.tsx'
import { FormField } from '@/shared/components/FormField/FormField.tsx'
import {
  RESET_PASSWORD_CLASS,
  RESET_PASSWORD_TEXT,
} from '../../ResetPasswordScreen.constants.ts'
import { RESET_PASSWORD_FIELD, RESET_PASSWORD_FORM_CLASS } from './ResetPasswordForm.constants.ts'
import type { ResetPasswordFormProps } from './ResetPasswordForm.types.ts'
import './ResetPasswordForm.css'

export function ResetPasswordForm({
  code,
  newPassword,
  areInputsDisabled,
  isSubmitDisabled,
  submitLabel,
  errorMessage,
  backToLoginLink,
  onCodeChange,
  onNewPasswordChange,
  onSubmit,
}: ResetPasswordFormProps): React.ReactElement {
  return (
    <form className={RESET_PASSWORD_FORM_CLASS.form} noValidate onSubmit={onSubmit}>
      <h1>{RESET_PASSWORD_TEXT.title}</h1>
      <p className={RESET_PASSWORD_CLASS.notice} role="status">
        {RESET_PASSWORD_TEXT.notice}
      </p>

      <FormField
        label={RESET_PASSWORD_FIELD.code.label}
        name={RESET_PASSWORD_FIELD.code.name}
        type={RESET_PASSWORD_FIELD.code.type}
        autoComplete={RESET_PASSWORD_FIELD.code.autoComplete}
        value={code}
        disabled={areInputsDisabled}
        autoFocus
        onValueChange={onCodeChange}
      />

      <FormField
        label={RESET_PASSWORD_FIELD.newPassword.label}
        name={RESET_PASSWORD_FIELD.newPassword.name}
        type={RESET_PASSWORD_FIELD.newPassword.type}
        autoComplete={RESET_PASSWORD_FIELD.newPassword.autoComplete}
        value={newPassword}
        disabled={areInputsDisabled}
        onValueChange={onNewPasswordChange}
      />

      {errorMessage}

      <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
        {submitLabel}
      </Button>

      {backToLoginLink}
    </form>
  )
}
