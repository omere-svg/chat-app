import { NewConversationActions } from './components/NewConversationActions/NewConversationActions.tsx'
import { NewConversationError } from './components/NewConversationError/NewConversationError.tsx'
import { NEW_CONVERSATION_TEXT } from './NewConversation.constants.ts'
import type { NewConversationFormContainerProps } from './NewConversation.types.ts'
import { NewConversationForm } from './NewConversationForm.tsx'
import { useNewConversation } from './hooks/useNewConversation.ts'

export function NewConversationFormContainer({
  onConversationCreated,
}: NewConversationFormContainerProps): React.ReactElement {
  const {
    participantEmail,
    setParticipantEmail,
    isSubmitting,
    errorMessage,
    handleSubmit,
    createAssistant,
    createTutor,
  } = useNewConversation(onConversationCreated)

  const canSubmit = participantEmail.trim().length > 0
  const errorNode = errorMessage ? (
    <NewConversationError message={errorMessage} />
  ) : null

  return (
    <>
      <NewConversationForm
        participantEmail={participantEmail}
        isSubmitting={isSubmitting}
        isSubmitDisabled={!canSubmit || isSubmitting}
        submitLabel={isSubmitting ? NEW_CONVERSATION_TEXT.starting : NEW_CONVERSATION_TEXT.submit}
        errorMessage={errorNode}
        onParticipantEmailChange={setParticipantEmail}
        onSubmit={handleSubmit}
      />
      <NewConversationActions
        disabled={isSubmitting}
        assistantLabel={isSubmitting ? NEW_CONVERSATION_TEXT.starting : NEW_CONVERSATION_TEXT.assistant}
        tutorLabel={isSubmitting ? NEW_CONVERSATION_TEXT.starting : NEW_CONVERSATION_TEXT.tutor}
        onCreateAssistant={() => void createAssistant()}
        onCreateTutor={() => void createTutor()}
      />
    </>
  )
}
