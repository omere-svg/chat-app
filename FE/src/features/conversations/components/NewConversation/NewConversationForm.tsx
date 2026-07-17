import { Button } from '@/shared/components/Button/Button.tsx'
import {
  NEW_CONVERSATION_CLASS,
  NEW_CONVERSATION_TEXT,
} from './NewConversation.constants.ts'
import type { NewConversationFormProps } from './NewConversation.types.ts'
import './NewConversation.css'

export function NewConversationForm({
  participantEmail,
  isSubmitting,
  isSubmitDisabled,
  submitLabel,
  errorMessage,
  onParticipantEmailChange,
  onSubmit,
}: NewConversationFormProps): React.ReactElement {
  return (
    <form className={NEW_CONVERSATION_CLASS.form} noValidate onSubmit={onSubmit}>
      <div className={NEW_CONVERSATION_CLASS.row}>
        <input
          className={NEW_CONVERSATION_CLASS.input}
          type="email"
          name="participantEmail"
          placeholder={NEW_CONVERSATION_TEXT.placeholder}
          aria-label={NEW_CONVERSATION_TEXT.inputAriaLabel}
          value={participantEmail}
          disabled={isSubmitting}
          onChange={(event) => onParticipantEmailChange(event.target.value)}
        />
        <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
          {submitLabel}
        </Button>
      </div>

      {errorMessage}
    </form>
  )
}
