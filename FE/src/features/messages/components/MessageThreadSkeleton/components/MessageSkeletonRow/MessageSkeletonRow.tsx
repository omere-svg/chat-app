import { Skeleton } from '@/shared/components/Skeleton/Skeleton.tsx'
import {
  MESSAGE_SKELETON_ROW_CLASS,
  MESSAGE_SKELETON_ROW_SIZE,
} from './MessageSkeletonRow.constants.ts'
import type { MessageSkeletonRowProps } from './MessageSkeletonRow.types.ts'
import './MessageSkeletonRow.css'

export function MessageSkeletonRow({
  isRight,
}: MessageSkeletonRowProps): React.ReactElement {
  const rowClassName = isRight
    ? `${MESSAGE_SKELETON_ROW_CLASS.row} ${MESSAGE_SKELETON_ROW_CLASS.rowRight}`
    : MESSAGE_SKELETON_ROW_CLASS.row

  return (
    <div className={rowClassName}>
      <Skeleton
        height={MESSAGE_SKELETON_ROW_SIZE.height}
        width={
          isRight
            ? MESSAGE_SKELETON_ROW_SIZE.rightWidth
            : MESSAGE_SKELETON_ROW_SIZE.leftWidth
        }
      />
    </div>
  )
}
