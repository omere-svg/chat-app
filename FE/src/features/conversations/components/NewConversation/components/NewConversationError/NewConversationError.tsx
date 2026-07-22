import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import { useNewConversationContext } from '@/features/conversations/components/NewConversation/context/useNewConversationContext.tsx'

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
