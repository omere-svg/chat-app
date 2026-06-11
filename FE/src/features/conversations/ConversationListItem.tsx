import type { ConversationPreview } from '../../types/domain.ts'

type ConversationListItemProps = {
  conversation: ConversationPreview
  isSelected: boolean
  onSelectConversation: (conversationId: string) => void
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelectConversation,
}: ConversationListItemProps): React.ReactElement {
  const lastMessagePreview =
    conversation.lastMessage?.body ?? 'No messages yet'

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`conversation-item${isSelected ? ' conversation-item--selected' : ''}`}
      onClick={() => onSelectConversation(conversation.id)}
    >
      <span className="conversation-item__title">{conversation.title}</span>
      <span className="conversation-item__preview">{lastMessagePreview}</span>
    </button>
  )
}
