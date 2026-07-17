import { ConversationBadge } from './components/ConversationBadge/ConversationBadge.tsx'
import { CONVERSATION_ITEM_TEXT } from './ConversationListItem.constants.ts'
import { ConversationListItem } from './ConversationListItem.tsx'
import type { ConversationListItemContainerProps } from './ConversationListItem.types.ts'
import {
  badgeLabelForType,
  conversationItemClassName,
} from './ConversationListItem.utils.ts'

export function ConversationListItemContainer({
  conversation,
  isSelected,
  onSelectConversation,
}: ConversationListItemContainerProps): React.ReactElement {
  const badgeLabel = badgeLabelForType(conversation.type)
  const badge = badgeLabel ? <ConversationBadge label={badgeLabel} /> : null
  const preview = conversation.lastMessage?.body ?? CONVERSATION_ITEM_TEXT.emptyPreview

  return (
    <ConversationListItem
      title={conversation.title}
      badge={badge}
      preview={preview}
      isSelected={isSelected}
      className={conversationItemClassName(isSelected)}
      onSelect={() => onSelectConversation(conversation.id)}
    />
  )
}
