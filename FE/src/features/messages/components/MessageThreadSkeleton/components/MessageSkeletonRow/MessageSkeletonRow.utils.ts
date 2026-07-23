import {
  MESSAGE_SKELETON_ROW_CLASS,
  MESSAGE_SKELETON_ROW_SIZE,
} from './MessageSkeletonRow.constants.ts'

export function messageSkeletonRowClassName(isRight: boolean): string {
  return isRight
    ? `${MESSAGE_SKELETON_ROW_CLASS.row} ${MESSAGE_SKELETON_ROW_CLASS.rowRight}`
    : MESSAGE_SKELETON_ROW_CLASS.row
}

export function messageSkeletonRowWidth(isRight: boolean): string {
  return isRight
    ? MESSAGE_SKELETON_ROW_SIZE.rightWidth
    : MESSAGE_SKELETON_ROW_SIZE.leftWidth
}
