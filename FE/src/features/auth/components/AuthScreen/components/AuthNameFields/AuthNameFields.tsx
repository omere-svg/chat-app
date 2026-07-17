import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { AUTH_FIELD } from '@/features/auth/components/AuthScreen/AuthScreen.constants.ts'
import type { AuthNameFieldsProps } from './AuthNameFields.types.ts'

export function AuthNameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  disabled,
}: AuthNameFieldsProps): React.ReactElement {
  return (
    <>
      <FormField
        label={AUTH_FIELD.firstName.label}
        name={AUTH_FIELD.firstName.name}
        type={AUTH_FIELD.firstName.type}
        autoComplete={AUTH_FIELD.firstName.autoComplete}
        value={firstName}
        disabled={disabled}
        onValueChange={onFirstNameChange}
      />
      <FormField
        label={AUTH_FIELD.lastName.label}
        name={AUTH_FIELD.lastName.name}
        type={AUTH_FIELD.lastName.type}
        autoComplete={AUTH_FIELD.lastName.autoComplete}
        value={lastName}
        disabled={disabled}
        onValueChange={onLastNameChange}
      />
    </>
  )
}
