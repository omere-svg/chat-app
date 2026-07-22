import { Button } from '@/shared/components/Button/Button.tsx'
import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { AUTH_FIELD, AUTH_SCREEN_CLASS, AUTH_SCREEN_TEXT } from './AuthScreen.constants.ts'
import type { AuthScreenProps } from './AuthScreen.types.ts'
import './AuthScreen.css'

export function AuthScreen({
  subtitle,
  nameFields,
  email,
  password,
  passwordAutoComplete,
  areInputsDisabled,
  onEmailChange,
  onPasswordChange,
  forgotPasswordLink,
  errorMessage,
  submitLabel,
  isSubmitDisabled,
  onSubmit,
  modeSwitch,
}: AuthScreenProps): React.ReactElement {
  return (
    <form className={AUTH_SCREEN_CLASS.form} noValidate onSubmit={onSubmit}>
      <h1>{AUTH_SCREEN_TEXT.appTitle}</h1>
      <p className={AUTH_SCREEN_CLASS.subtitle}>{subtitle}</p>

      {nameFields}

      <FormField
        label={AUTH_FIELD.email.label}
        name={AUTH_FIELD.email.name}
        type={AUTH_FIELD.email.type}
        autoComplete={AUTH_FIELD.email.autoComplete}
        value={email}
        disabled={areInputsDisabled}
        autoFocus
        onValueChange={onEmailChange}
      />

      <FormField
        label={AUTH_FIELD.password.label}
        name={AUTH_FIELD.password.name}
        type={AUTH_FIELD.password.type}
        autoComplete={passwordAutoComplete}
        value={password}
        disabled={areInputsDisabled}
        onValueChange={onPasswordChange}
      />

      {forgotPasswordLink}

      {errorMessage}

      <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
        {submitLabel}
      </Button>

      {modeSwitch}
    </form>
  )
}
