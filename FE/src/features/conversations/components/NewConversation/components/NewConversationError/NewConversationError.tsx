import { NEW_CONVERSATION_CLASS } from '../../NewConversation.constants.ts'
import { useNewConversationContext } from '../../context/useNewConversationContext.tsx'

export function NewConversationError(): React.ReactElement | null {
  const { errorMessage } = useNewConversationContext()

  if (errorMessage === null) {
    return null
  }

  return (
    <p className={NEW_CONVERSATION_CLASS.error} role="alert">
      {errorMessage}
    </p>
  )
}
