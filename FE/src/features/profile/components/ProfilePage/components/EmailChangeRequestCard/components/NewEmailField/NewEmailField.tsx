import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { useEmailChangeRequestContext } from '../../context/useEmailChangeRequestContext.tsx'
import { NEW_EMAIL_FIELD, NEW_EMAIL_FIELD_TEXT } from './NewEmailField.constants.ts'

export function NewEmailField(): React.ReactElement {
  const { newEmail, setNewEmail, isSubmitting } = useEmailChangeRequestContext()

  return (
    <FormField
      label={NEW_EMAIL_FIELD_TEXT.label}
      name={NEW_EMAIL_FIELD.name}
      type={NEW_EMAIL_FIELD.type}
      autoComplete={NEW_EMAIL_FIELD.autoComplete}
      value={newEmail}
      disabled={isSubmitting}
      onValueChange={setNewEmail}
    />
  )
}
