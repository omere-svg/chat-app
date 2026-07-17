import {
  MESSAGE_THREAD_SKELETON_CLASS,
  MESSAGE_THREAD_SKELETON_TEXT,
} from './MessageThreadSkeleton.constants.ts'
import type { MessageThreadSkeletonProps } from './MessageThreadSkeleton.types.ts'

export function MessageThreadSkeleton({
  rows,
}: MessageThreadSkeletonProps): React.ReactElement {
  return (
    <div
      className={MESSAGE_THREAD_SKELETON_CLASS.root}
      aria-busy="true"
      aria-label={MESSAGE_THREAD_SKELETON_TEXT.ariaLabel}
    >
      {rows}
    </div>
  )
}
