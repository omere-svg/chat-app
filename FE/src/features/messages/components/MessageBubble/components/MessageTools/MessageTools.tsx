import {
  MESSAGE_TOOLS_CLASS,
  MESSAGE_TOOLS_TEXT,
} from './MessageTools.constants.ts'
import type { MessageToolsProps } from './MessageTools.types.ts'
import './MessageTools.css'

export function MessageTools({ items }: MessageToolsProps): React.ReactElement {
  return (
    <ul
      className={MESSAGE_TOOLS_CLASS.list}
      aria-label={MESSAGE_TOOLS_TEXT.ariaLabel}
    >
      {items}
    </ul>
  )
}
