import { SkeletonRow } from './components/SkeletonRow/SkeletonRow.tsx'
import { CONVERSATION_LIST_SKELETON_ROW_COUNT } from './ConversationListSkeleton.constants.ts'
import { ConversationListSkeleton } from './ConversationListSkeleton.tsx'

export function ConversationListSkeletonContainer(): React.ReactElement {
  const rows = Array.from(
    { length: CONVERSATION_LIST_SKELETON_ROW_COUNT },
    (_unused, index) => <SkeletonRow key={index} />,
  )

  return <ConversationListSkeleton>{rows}</ConversationListSkeleton>
}
