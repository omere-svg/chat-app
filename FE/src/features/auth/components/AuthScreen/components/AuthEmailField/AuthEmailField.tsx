import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { AUTH_FIELD } from '../../AuthScreen.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthEmailField(): React.ReactElement {
  const { email, isSubmitting, setEmail } = useAuthScreenContext()

  return (
    <FormField
      label={AUTH_FIELD.email.label}
      name={AUTH_FIELD.email.name}
      type={AUTH_FIELD.email.type}
      autoComplete={AUTH_FIELD.email.autoComplete}
      value={email}
      disabled={isSubmitting}
      autoFocus
      onValueChange={setEmail}
    />
  )
}
