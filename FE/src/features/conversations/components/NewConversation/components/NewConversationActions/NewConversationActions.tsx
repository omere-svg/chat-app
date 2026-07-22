import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import { useNewConversationContext } from '@/features/conversations/components/NewConversation/context/useNewConversationContext.tsx'

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
