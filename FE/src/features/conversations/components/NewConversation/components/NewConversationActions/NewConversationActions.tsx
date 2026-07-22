import { NEW_CONVERSATION_CLASS } from '../../NewConversation.constants.ts'
import { useNewConversationContext } from '../../context/useNewConversationContext.tsx'

export function NewConversationActions(): React.ReactElement {
  const { isSubmitting, assistantLabel, tutorLabel, handleCreateAssistant, handleCreateTutor } =
    useNewConversationContext()

  return (
    <>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.assistant}
        disabled={isSubmitting}
        onClick={handleCreateAssistant}
      >
        {assistantLabel}
      </button>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.tutor}
        disabled={isSubmitting}
        onClick={handleCreateTutor}
      >
        {tutorLabel}
      </button>
    </>
  )
}
