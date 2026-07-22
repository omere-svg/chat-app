import { Button } from '@/shared/components/Button/Button.tsx'
import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { FORGOT_PASSWORD_CLASS, FORGOT_PASSWORD_FIELD, FORGOT_PASSWORD_TEXT } from './ForgotPasswordScreen.constants.ts'
import type { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types.ts'
import './ForgotPasswordScreen.css'

export function ForgotPasswordScreen({
  email,
  areInputsDisabled,
  isSubmitDisabled,
  submitLabel,
  errorMessage,
  backToLoginLink,
  onEmailChange,
  onSubmit,
}: ForgotPasswordScreenProps): React.ReactElement {
  return (
    <form className={FORGOT_PASSWORD_CLASS.form} noValidate onSubmit={onSubmit}>
      <h1>{FORGOT_PASSWORD_TEXT.title}</h1>
      <p className={FORGOT_PASSWORD_CLASS.subtitle}>{FORGOT_PASSWORD_TEXT.subtitle}</p>

      <FormField
        label={FORGOT_PASSWORD_FIELD.email.label}
        name={FORGOT_PASSWORD_FIELD.email.name}
        type={FORGOT_PASSWORD_FIELD.email.type}
        autoComplete={FORGOT_PASSWORD_FIELD.email.autoComplete}
        value={email}
        disabled={areInputsDisabled}
        autoFocus
        onValueChange={onEmailChange}
      />

      {errorMessage}

      <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
        {submitLabel}
      </Button>

      {backToLoginLink}
    </form>
  )
}
