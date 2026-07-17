import {
  CONVERSATION_LIST_CLASS,
  CONVERSATION_LIST_TEXT,
} from './ConversationList.constants.ts'
import type { ConversationListProps } from './ConversationList.types.ts'
import './ConversationList.css'

export function ConversationList({
  items,
}: ConversationListProps): React.ReactElement {
  return (
    <div
      className={CONVERSATION_LIST_CLASS.list}
      role="listbox"
      aria-label={CONVERSATION_LIST_TEXT.ariaLabel}
    >
      {items}
    </div>
  )
}
