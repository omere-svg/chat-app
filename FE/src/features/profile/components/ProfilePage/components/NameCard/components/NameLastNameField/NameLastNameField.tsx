import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { useProfileNameContext } from '../../context/useProfileNameContext.tsx'
import { NAME_CARD_TEXT, NAME_FIELD } from '../../NameCard.constants.ts'

export function NameLastNameField(): React.ReactElement {
  const { lastName, isSaving, setLastName } = useProfileNameContext()

  return (
    <FormField
      label={NAME_CARD_TEXT.lastNameLabel}
      name={NAME_FIELD.lastName.name}
      type={NAME_FIELD.lastName.type}
      autoComplete={NAME_FIELD.lastName.autoComplete}
      value={lastName}
      disabled={isSaving}
      onValueChange={setLastName}
    />
  )
}
