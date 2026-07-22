import { useConversationItemContext } from '../../context/useConversationItemContext.tsx'
import { CONVERSATION_BADGE_CLASS } from './ConversationBadge.constants.ts'
import './ConversationBadge.css'

export function ConversationBadge(): React.ReactElement | null {
  const { badgeLabel } = useConversationItemContext()

  if (badgeLabel === null) {
    return null
  }

  return <span className={CONVERSATION_BADGE_CLASS.badge}>{badgeLabel}</span>
}
