import { MESSAGE_LIST_CLASS } from './MessageList.constants.ts'
import type { MessageListProps } from './MessageList.types.ts'
import './MessageList.css'

export function MessageList({ children }: MessageListProps): React.ReactElement {
  return (
    <div className={MESSAGE_LIST_CLASS.list} role="log" aria-live="polite">
      {children}
    </div>
  )
}
