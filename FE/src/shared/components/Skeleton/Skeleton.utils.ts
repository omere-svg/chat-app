import { SKELETON_CLASS } from './Skeleton.constants.ts'

export function skeletonClassName(extraClassName: string): string {
  return [SKELETON_CLASS.base, extraClassName].filter(Boolean).join(' ')
}
