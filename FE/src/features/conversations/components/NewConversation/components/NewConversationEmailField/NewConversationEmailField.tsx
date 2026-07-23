import { useNewConversationContext } from '../../context/useNewConversationContext.tsx'
import {
  NEW_CONVERSATION_EMAIL_FIELD_CLASS,
  NEW_CONVERSATION_EMAIL_FIELD_TEXT,
} from './NewConversationEmailField.constants.ts'

export function NewConversationEmailField(): React.ReactElement {
  const { participantEmail, isSubmitting, handleParticipantEmailChange } =
    useNewConversationContext()

  return (
    <input
      className={NEW_CONVERSATION_EMAIL_FIELD_CLASS.input}
      type="email"
      name="participantEmail"
      placeholder={NEW_CONVERSATION_EMAIL_FIELD_TEXT.placeholder}
      aria-label={NEW_CONVERSATION_EMAIL_FIELD_TEXT.inputAriaLabel}
      value={participantEmail}
      disabled={isSubmitting}
      onChange={handleParticipantEmailChange}
    />
  )
}
