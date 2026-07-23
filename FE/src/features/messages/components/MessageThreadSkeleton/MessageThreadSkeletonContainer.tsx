import { MessageSkeletonRow } from './components/MessageSkeletonRow/MessageSkeletonRow.tsx'
import {
  messageSkeletonRowClassName,
  messageSkeletonRowWidth,
} from './components/MessageSkeletonRow/MessageSkeletonRow.utils.ts'
import { MESSAGE_THREAD_SKELETON_ROW_COUNT } from './MessageThreadSkeleton.constants.ts'
import { MessageThreadSkeleton } from './MessageThreadSkeleton.tsx'

export function MessageThreadSkeletonContainer(): React.ReactElement {
  const rows = Array.from(
    { length: MESSAGE_THREAD_SKELETON_ROW_COUNT },
    (_unused, index) => {
      const isRight = index % 2 !== 0
      return (
        <MessageSkeletonRow
          key={index}
          className={messageSkeletonRowClassName(isRight)}
          width={messageSkeletonRowWidth(isRight)}
        />
      )
    },
  )

  return <MessageThreadSkeleton>{rows}</MessageThreadSkeleton>
}
