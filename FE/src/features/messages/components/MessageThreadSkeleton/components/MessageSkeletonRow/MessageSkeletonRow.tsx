import { Skeleton } from '@/shared/components/Skeleton/Skeleton.tsx'
import { MESSAGE_SKELETON_ROW_SIZE } from './MessageSkeletonRow.constants.ts'
import type { MessageSkeletonRowProps } from './MessageSkeletonRow.types.ts'
import './MessageSkeletonRow.css'

export function MessageSkeletonRow({
  className,
  width,
}: MessageSkeletonRowProps): React.ReactElement {
  return (
    <div className={className}>
      <Skeleton height={MESSAGE_SKELETON_ROW_SIZE.height} width={width} />
    </div>
  )
}
