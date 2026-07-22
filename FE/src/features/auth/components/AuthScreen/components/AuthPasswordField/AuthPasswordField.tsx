import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { AUTH_FIELD } from '../../AuthScreen.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthPasswordField(): React.ReactElement {
  const { password, passwordAutoComplete, isSubmitting, setPassword } =
    useAuthScreenContext()

  return (
    <FormField
      label={AUTH_FIELD.password.label}
      name={AUTH_FIELD.password.name}
      type={AUTH_FIELD.password.type}
      autoComplete={passwordAutoComplete}
      value={password}
      disabled={isSubmitting}
      onValueChange={setPassword}
    />
  )
}
