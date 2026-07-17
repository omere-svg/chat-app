import { Skeleton } from '@/shared/components/Skeleton/Skeleton.tsx'
import { SKELETON_ROW_CLASS, SKELETON_ROW_SIZE } from './SkeletonRow.constants.ts'
import './SkeletonRow.css'

export function SkeletonRow(): React.ReactElement {
  return (
    <div className={SKELETON_ROW_CLASS.row}>
      <Skeleton
        height={SKELETON_ROW_SIZE.title.height}
        width={SKELETON_ROW_SIZE.title.width}
      />
      <Skeleton
        height={SKELETON_ROW_SIZE.subtitle.height}
        width={SKELETON_ROW_SIZE.subtitle.width}
      />
    </div>
  )
}
