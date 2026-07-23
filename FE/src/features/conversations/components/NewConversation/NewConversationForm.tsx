import { Button } from '@/shared/components/Button/Button.tsx'
import { NewConversationEmailField } from './components/NewConversationEmailField/NewConversationEmailField.tsx'
import { NewConversationError } from './components/NewConversationError/NewConversationError.tsx'
import { useNewConversationContext } from './context/useNewConversationContext.tsx'
import { NEW_CONVERSATION_CLASS } from './NewConversation.constants.ts'
import './NewConversation.css'

export function NewConversationForm(): React.ReactElement {
  const { isSubmitDisabled, submitLabel, handleSubmit } = useNewConversationContext()

  return (
    <form className={NEW_CONVERSATION_CLASS.form} noValidate onSubmit={handleSubmit}>
      <div className={NEW_CONVERSATION_CLASS.row}>
        <NewConversationEmailField />
        <Button type="submit" variant="primary" disabled={isSubmitDisabled}>
          {submitLabel}
        </Button>
      </div>

      <NewConversationError />
    </form>
  )
}
