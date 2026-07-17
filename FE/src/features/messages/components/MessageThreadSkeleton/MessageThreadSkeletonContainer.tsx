import { MessageSkeletonRow } from './components/MessageSkeletonRow/MessageSkeletonRow.tsx'
import { MESSAGE_THREAD_SKELETON_ROW_COUNT } from './MessageThreadSkeleton.constants.ts'
import { MessageThreadSkeleton } from './MessageThreadSkeleton.tsx'

export function MessageThreadSkeletonContainer(): React.ReactElement {
  const rows = Array.from(
    { length: MESSAGE_THREAD_SKELETON_ROW_COUNT },
    (_unused, index) => (
      <MessageSkeletonRow key={index} isRight={index % 2 !== 0} />
    ),
  )

  return <MessageThreadSkeleton rows={rows} />
}
