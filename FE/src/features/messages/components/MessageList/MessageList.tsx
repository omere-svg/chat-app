import { MESSAGE_LIST_CLASS } from './MessageList.constants.ts'
import type { MessageListProps } from './MessageList.types.ts'
import './MessageList.css'

export function MessageList({ items }: MessageListProps): React.ReactElement {
  return (
    <div className={MESSAGE_LIST_CLASS.list} role="log" aria-live="polite">
      {items}
    </div>
  )
}
