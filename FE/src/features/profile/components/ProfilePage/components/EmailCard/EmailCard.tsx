import { Button } from '@/shared/components/Button/Button.tsx'
import { FormField } from '@/shared/components/FormField/FormField.tsx'
import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import {
  EMAIL_CARD_HEADING_ID,
  EMAIL_CARD_TEXT,
  EMAIL_FIELD,
} from './EmailCard.constants.ts'
import type { EmailCardProps } from './EmailCard.types.ts'

export function EmailCard({
  email,
  currentPassword,
  onEmailChange,
  onCurrentPasswordChange,
  onSubmit,
  areInputsDisabled,
  isSubmitDisabled,
  submitLabel,
  statusMessage,
}: EmailCardProps): React.ReactElement {
  return (
    <ProfileCard
      title={EMAIL_CARD_TEXT.title}
      headingId={EMAIL_CARD_HEADING_ID}
      onSubmit={onSubmit}
      actions={
        <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
          {submitLabel}
        </Button>
      }
    >
      <FormField
        label={EMAIL_CARD_TEXT.emailLabel}
        name={EMAIL_FIELD.email.name}
        type={EMAIL_FIELD.email.type}
        autoComplete={EMAIL_FIELD.email.autoComplete}
        value={email}
        disabled={areInputsDisabled}
        onValueChange={onEmailChange}
      />
      <FormField
        label={EMAIL_CARD_TEXT.passwordLabel}
        name={EMAIL_FIELD.currentPassword.name}
        type={EMAIL_FIELD.currentPassword.type}
        autoComplete={EMAIL_FIELD.currentPassword.autoComplete}
        value={currentPassword}
        disabled={areInputsDisabled}
        onValueChange={onCurrentPasswordChange}
      />
      {statusMessage}
    </ProfileCard>
  )
}
