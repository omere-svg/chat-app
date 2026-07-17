import { FormStatusMessage } from '../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../FormStatusMessage/FormStatusMessage.utils.ts'
import { EmailCard } from './EmailCard.tsx'
import { useProfileEmail } from './hooks/useProfileEmail.ts'

export function EmailCardContainer(): React.ReactElement {
  const {
    email,
    currentPassword,
    setEmail,
    setCurrentPassword,
    isSaving,
    canSave,
    status,
    submitLabel,
    handleSubmit,
  } = useProfileEmail()

  const statusMessage = status ? (
    <FormStatusMessage {...toFormStatusView(status)} />
  ) : null

  return (
    <EmailCard
      email={email}
      currentPassword={currentPassword}
      onEmailChange={setEmail}
      onCurrentPasswordChange={setCurrentPassword}
      onSubmit={handleSubmit}
      areInputsDisabled={isSaving}
      isSubmitDisabled={!canSave || isSaving}
      submitLabel={submitLabel}
      statusMessage={statusMessage}
    />
  )
}
