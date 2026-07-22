import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { useProfileNameContext } from '../../context/useProfileNameContext.tsx'
import { NAME_CARD_TEXT, NAME_FIELD } from '../../NameCard.constants.ts'

export function NameFirstNameField(): React.ReactElement {
  const { firstName, isSaving, setFirstName } = useProfileNameContext()

  return (
    <FormField
      label={NAME_CARD_TEXT.firstNameLabel}
      name={NAME_FIELD.firstName.name}
      type={NAME_FIELD.firstName.type}
      autoComplete={NAME_FIELD.firstName.autoComplete}
      value={firstName}
      disabled={isSaving}
      onValueChange={setFirstName}
    />
  )
}
