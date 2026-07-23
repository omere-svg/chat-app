import { ConversationBadge } from './components/ConversationBadge/ConversationBadge.tsx'
import { useConversationItemContext } from './context/useConversationItemContext.tsx'
import { CONVERSATION_ITEM_CLASS } from './ConversationListItem.constants.ts'
import './ConversationListItem.css'

export function ConversationListItem(): React.ReactElement {
  const { title, preview, isSelected, className, onSelect } =
    useConversationItemContext()

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
        <ConversationBadge />
      </span>
      <span className={CONVERSATION_ITEM_CLASS.preview}>{preview}</span>
    </button>
  )
}
