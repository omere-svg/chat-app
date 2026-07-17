import { CONVERSATION_BADGE_CLASS } from './ConversationBadge.constants.ts'
import type { ConversationBadgeProps } from './ConversationBadge.types.ts'
import './ConversationBadge.css'

export function ConversationBadge({
  label,
}: ConversationBadgeProps): React.ReactElement {
  return <span className={CONVERSATION_BADGE_CLASS.badge}>{label}</span>
}
