import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import { useNewConversationContext } from '@/features/conversations/components/NewConversation/context/useNewConversationContext.tsx'

export function NewConversationActions(): React.ReactElement {
  const { isSubmitting, assistantLabel, tutorLabel, createAssistant, createTutor } =
    useNewConversationContext()

  return (
    <>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.assistant}
        disabled={isSubmitting}
        onClick={() => void createAssistant()}
      >
        {assistantLabel}
      </button>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.tutor}
        disabled={isSubmitting}
        onClick={() => void createTutor()}
      >
        {tutorLabel}
      </button>
    </>
  )
}
