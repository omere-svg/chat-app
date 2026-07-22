import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { RESET_PASSWORD_FIELD } from '../../ResetPasswordForm.constants.ts'
import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'

export function ResetPasswordCodeField(): React.ReactElement {
  const { code, areInputsDisabled, setCode } = useResetPasswordContext()

  return (
    <FormField
      label={RESET_PASSWORD_FIELD.code.label}
      name={RESET_PASSWORD_FIELD.code.name}
      type={RESET_PASSWORD_FIELD.code.type}
      autoComplete={RESET_PASSWORD_FIELD.code.autoComplete}
      value={code}
      disabled={areInputsDisabled}
      autoFocus
      onValueChange={setCode}
    />
  )
}
