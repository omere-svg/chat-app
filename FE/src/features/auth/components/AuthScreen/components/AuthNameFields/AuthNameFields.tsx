import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { AUTH_FIELD } from '../../AuthScreen.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'

export function AuthNameFields(): React.ReactElement {
  const { firstName, lastName, isSubmitting, setFirstName, setLastName } =
    useAuthScreenContext()

  return (
    <>
      <FormField
        label={AUTH_FIELD.firstName.label}
        name={AUTH_FIELD.firstName.name}
        type={AUTH_FIELD.firstName.type}
        autoComplete={AUTH_FIELD.firstName.autoComplete}
        value={firstName}
        disabled={isSubmitting}
        onValueChange={setFirstName}
      />
      <FormField
        label={AUTH_FIELD.lastName.label}
        name={AUTH_FIELD.lastName.name}
        type={AUTH_FIELD.lastName.type}
        autoComplete={AUTH_FIELD.lastName.autoComplete}
        value={lastName}
        disabled={isSubmitting}
        onValueChange={setLastName}
      />
    </>
  )
}
