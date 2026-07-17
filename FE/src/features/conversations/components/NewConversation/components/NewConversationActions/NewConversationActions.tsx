import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import type { NewConversationActionsProps } from '@/features/conversations/components/NewConversation/NewConversation.types.ts'

export function NewConversationActions({
  disabled,
  assistantLabel,
  tutorLabel,
  onCreateAssistant,
  onCreateTutor,
}: NewConversationActionsProps): React.ReactElement {
  return (
    <>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.assistant}
        disabled={disabled}
        onClick={onCreateAssistant}
      >
        {assistantLabel}
      </button>
      <button
        type="button"
        className={NEW_CONVERSATION_CLASS.tutor}
        disabled={disabled}
        onClick={onCreateTutor}
      >
        {tutorLabel}
      </button>
    </>
  )
}
