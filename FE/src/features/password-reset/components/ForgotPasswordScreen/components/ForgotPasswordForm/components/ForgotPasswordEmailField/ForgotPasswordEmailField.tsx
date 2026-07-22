import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { FORGOT_PASSWORD_FIELD } from '../../../../ForgotPasswordScreen.constants.ts'
import { useForgotPasswordContext } from '../../../../context/useForgotPasswordContext.tsx'

export function ForgotPasswordEmailField(): React.ReactElement {
  const { email, areInputsDisabled, setEmail } = useForgotPasswordContext()

  return (
    <FormField
      label={FORGOT_PASSWORD_FIELD.email.label}
      name={FORGOT_PASSWORD_FIELD.email.name}
      type={FORGOT_PASSWORD_FIELD.email.type}
      autoComplete={FORGOT_PASSWORD_FIELD.email.autoComplete}
      value={email}
      disabled={areInputsDisabled}
      autoFocus
      onValueChange={setEmail}
    />
  )
}
