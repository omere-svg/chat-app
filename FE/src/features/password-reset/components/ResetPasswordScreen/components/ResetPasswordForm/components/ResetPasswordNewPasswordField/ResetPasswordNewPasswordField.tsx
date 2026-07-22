import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { RESET_PASSWORD_FIELD } from '../../ResetPasswordForm.constants.ts'
import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'

export function ResetPasswordNewPasswordField(): React.ReactElement {
  const { newPassword, areInputsDisabled, setNewPassword } = useResetPasswordContext()

  return (
    <FormField
      label={RESET_PASSWORD_FIELD.newPassword.label}
      name={RESET_PASSWORD_FIELD.newPassword.name}
      type={RESET_PASSWORD_FIELD.newPassword.type}
      autoComplete={RESET_PASSWORD_FIELD.newPassword.autoComplete}
      value={newPassword}
      disabled={areInputsDisabled}
      onValueChange={setNewPassword}
    />
  )
}
