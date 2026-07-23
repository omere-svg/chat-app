import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'
import { MESSAGE_THREAD_HEADER_CLASS } from './MessageThreadHeader.constants.ts'
import './MessageThreadHeader.css'

export function MessageThreadHeader(): React.ReactElement {
  const { conversationTitle } = useMessageThreadContext()

  return (
    <header className={MESSAGE_THREAD_HEADER_CLASS.header}>
      <h2>{conversationTitle}</h2>
    </header>
  )
}
