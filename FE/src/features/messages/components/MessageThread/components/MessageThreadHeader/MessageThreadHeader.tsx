import { MESSAGE_THREAD_HEADER_CLASS } from './MessageThreadHeader.constants.ts'
import type { MessageThreadHeaderProps } from './MessageThreadHeader.types.ts'
import './MessageThreadHeader.css'

export function MessageThreadHeader({
  title,
}: MessageThreadHeaderProps): React.ReactElement {
  return (
    <header className={MESSAGE_THREAD_HEADER_CLASS.header}>
      <h2>{title}</h2>
    </header>
  )
}
