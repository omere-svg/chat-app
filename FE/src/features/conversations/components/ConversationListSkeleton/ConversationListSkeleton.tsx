import {
  CONVERSATION_LIST_SKELETON_CLASS,
  CONVERSATION_LIST_SKELETON_TEXT,
} from './ConversationListSkeleton.constants.ts'
import type { ConversationListSkeletonProps } from './ConversationListSkeleton.types.ts'
import './ConversationListSkeleton.css'

export function ConversationListSkeleton({
  rows,
}: ConversationListSkeletonProps): React.ReactElement {
  return (
    <div
      className={CONVERSATION_LIST_SKELETON_CLASS.root}
      aria-busy="true"
      aria-label={CONVERSATION_LIST_SKELETON_TEXT.ariaLabel}
    >
      {rows}
    </div>
  )
}
