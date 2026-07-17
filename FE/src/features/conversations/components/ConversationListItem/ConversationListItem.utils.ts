import type { ConversationType } from '@/types/domain.ts'
import {
  CONVERSATION_BADGE_LABEL,
  CONVERSATION_ITEM_CLASS,
} from './ConversationListItem.constants.ts'

export function badgeLabelForType(type: ConversationType): string | null {
  if (type === 'assistant') return CONVERSATION_BADGE_LABEL.assistant
  if (type === 'tutor') return CONVERSATION_BADGE_LABEL.tutor
  return null
}

export function conversationItemClassName(isSelected: boolean): string {
  return isSelected
    ? `${CONVERSATION_ITEM_CLASS.base} ${CONVERSATION_ITEM_CLASS.selected}`
    : CONVERSATION_ITEM_CLASS.base
}
