import { SKELETON_DEFAULT } from './Skeleton.constants.ts'
import type { SkeletonProps } from './Skeleton.types.ts'
import { skeletonClassName } from './Skeleton.utils.ts'
import './Skeleton.css'

export function Skeleton({
  width = SKELETON_DEFAULT.width,
  height = SKELETON_DEFAULT.height,
  className = '',
}: SkeletonProps): React.ReactElement {
  return (
    <div
      className={skeletonClassName(className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
