import { FormStatusMessage } from '../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../FormStatusMessage/FormStatusMessage.utils.ts'
import { NameCard } from './NameCard.tsx'
import { useProfileName } from './hooks/useProfileName.ts'

export function NameCardContainer(): React.ReactElement {
  const {
    firstName,
    lastName,
    setFirstName,
    setLastName,
    isSaving,
    canSave,
    status,
    submitLabel,
    handleSubmit,
  } = useProfileName()

  const statusMessage = status ? (
    <FormStatusMessage {...toFormStatusView(status)} />
  ) : null

  return (
    <NameCard
      firstName={firstName}
      lastName={lastName}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onSubmit={handleSubmit}
      areInputsDisabled={isSaving}
      isSubmitDisabled={!canSave || isSaving}
      submitLabel={submitLabel}
      statusMessage={statusMessage}
    />
  )
}
