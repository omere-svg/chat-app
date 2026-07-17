import { NEW_CONVERSATION_CLASS } from '@/features/conversations/components/NewConversation/NewConversation.constants.ts'
import type { NewConversationErrorProps } from '@/features/conversations/components/NewConversation/NewConversation.types.ts'

export function NewConversationError({
  message,
}: NewConversationErrorProps): React.ReactElement {
  return (
    <p className={NEW_CONVERSATION_CLASS.error} role="alert">
      {message}
    </p>
  )
}
