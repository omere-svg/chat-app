import { EmptyState } from '@/shared/components/EmptyState/EmptyState.tsx'
import { CONVERSATION_EMPTY_STATE_TEXT } from './ConversationEmptyState.constants.ts'

export function ConversationEmptyState(): React.ReactElement {
  return (
    <EmptyState
      title={CONVERSATION_EMPTY_STATE_TEXT.title}
      description={CONVERSATION_EMPTY_STATE_TEXT.description}
    />
  )
}
