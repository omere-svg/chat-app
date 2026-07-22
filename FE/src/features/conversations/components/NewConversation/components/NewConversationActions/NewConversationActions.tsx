import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import { useNewConversationContext } from '@/features/conversations/components/NewConversation/context/useNewConversationContext.tsx'

export function NewConversationActions(): React.ReactElement {
  const { isSubmitting, assistantLabel, tutorLabel, onCreateAssistant, onCreateTutor } =
    useNewConversationContext()

  return (
    <>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.assistant}
        disabled={isSubmitting}
        onClick={onCreateAssistant}
      >
        {assistantLabel}
      </button>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.tutor}
        disabled={isSubmitting}
        onClick={onCreateTutor}
      >
        {tutorLabel}
      </button>
    </>
  )
}
