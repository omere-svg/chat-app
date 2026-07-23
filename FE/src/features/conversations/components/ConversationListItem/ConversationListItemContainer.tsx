import { ConversationItemProvider } from './context/useConversationItemContext.tsx'
import { ConversationListItem } from './ConversationListItem.tsx'
import type { ConversationListItemContainerProps } from './ConversationListItem.types.ts'

export function ConversationListItemContainer({
  conversation,
}: ConversationListItemContainerProps): React.ReactElement {
  return (
    <ConversationItemProvider conversation={conversation}>
      <ConversationListItem />
    </ConversationItemProvider>
  )
}
