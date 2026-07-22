import { Button } from '@/shared/components/Button/Button.tsx'
import { NewConversationError } from './components/NewConversationError/NewConversationError.tsx'
import { useNewConversationContext } from './context/useNewConversationContext.tsx'
import {
  NEW_CONVERSATION_CLASS,
  NEW_CONVERSATION_TEXT,
} from './NewConversation.constants.ts'
import './NewConversation.css'

export function NewConversationForm(): React.ReactElement {
  const {
    participantEmail,
    isSubmitting,
    isSubmitDisabled,
    submitLabel,
    setParticipantEmail,
    handleSubmit,
  } = useNewConversationContext()

  return (
    <form className={NEW_CONVERSATION_CLASS.form} noValidate onSubmit={handleSubmit}>
      <div className={NEW_CONVERSATION_CLASS.row}>
        <input
          className={NEW_CONVERSATION_CLASS.input}
          type="email"
          name="participantEmail"
          placeholder={NEW_CONVERSATION_TEXT.placeholder}
          aria-label={NEW_CONVERSATION_TEXT.inputAriaLabel}
          value={participantEmail}
          disabled={isSubmitting}
          onChange={(event) => setParticipantEmail(event.target.value)}
        />
        <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
          {submitLabel}
        </Button>
      </div>

      <NewConversationError />
    </form>
  )
}
