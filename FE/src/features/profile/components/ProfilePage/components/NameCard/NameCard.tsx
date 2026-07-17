import { Button } from '@/shared/components/Button/Button.tsx'
import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import {
  NAME_CARD_HEADING_ID,
  NAME_CARD_TEXT,
  NAME_FIELD,
} from './NameCard.constants.ts'
import type { NameCardProps } from './NameCard.types.ts'

export function NameCard({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  areInputsDisabled,
  isSubmitDisabled,
  submitLabel,
  statusMessage,
}: NameCardProps): React.ReactElement {
  return (
    <ProfileCard
      title={NAME_CARD_TEXT.title}
      headingId={NAME_CARD_HEADING_ID}
      onSubmit={onSubmit}
      actions={
        <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
          {submitLabel}
        </Button>
      }
    >
      <FormField
        label={NAME_CARD_TEXT.firstNameLabel}
        name={NAME_FIELD.firstName.name}
        type={NAME_FIELD.firstName.type}
        autoComplete={NAME_FIELD.firstName.autoComplete}
        value={firstName}
        disabled={areInputsDisabled}
        onValueChange={onFirstNameChange}
      />
      <FormField
        label={NAME_CARD_TEXT.lastNameLabel}
        name={NAME_FIELD.lastName.name}
        type={NAME_FIELD.lastName.type}
        autoComplete={NAME_FIELD.lastName.autoComplete}
        value={lastName}
        disabled={areInputsDisabled}
        onValueChange={onLastNameChange}
      />
      {statusMessage}
    </ProfileCard>
  )
}
