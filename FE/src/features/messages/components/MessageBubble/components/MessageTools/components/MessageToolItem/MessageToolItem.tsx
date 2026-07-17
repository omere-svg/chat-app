import {
  MESSAGE_TOOL_ITEM_CLASS,
  MESSAGE_TOOL_ITEM_TEXT,
} from './MessageToolItem.constants.ts'
import type { MessageToolItemProps } from './MessageToolItem.types.ts'
import './MessageToolItem.css'

export function MessageToolItem({
  label,
  isDone,
}: MessageToolItemProps): React.ReactElement {
  const itemClassName = isDone
    ? `${MESSAGE_TOOL_ITEM_CLASS.item} ${MESSAGE_TOOL_ITEM_CLASS.done}`
    : MESSAGE_TOOL_ITEM_CLASS.item

  return (
    <li className={itemClassName}>
      {label}
      {isDone ? '' : MESSAGE_TOOL_ITEM_TEXT.pendingSuffix}
    </li>
  )
}
