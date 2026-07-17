import { CONVERSATION_ITEM_CLASS } from './ConversationListItem.constants.ts'
import type { ConversationListItemProps } from './ConversationListItem.types.ts'
import './ConversationListItem.css'

export function ConversationListItem({
  title,
  badge,
  preview,
  isSelected,
  className,
  onSelect,
}: ConversationListItemProps): React.ReactElement {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={className}
      onClick={onSelect}
    >
      <span className={CONVERSATION_ITEM_CLASS.title}>
        {title}
        {badge}
      </span>
      <span className={CONVERSATION_ITEM_CLASS.preview}>{preview}</span>
    </button>
  )
}
