import { MESSAGE_THREAD_CLASS } from './MessageThread.constants.ts'
import { useMessageThreadContext } from './context/useMessageThreadContext.tsx'
import { MessageThreadBodyContainer } from './components/MessageThreadBody/MessageThreadBodyContainer.tsx'
import { MessageThreadComposerContainer } from './components/MessageThreadComposer/MessageThreadComposerContainer.tsx'
import { MessageThreadHeaderContainer } from './components/MessageThreadHeader/MessageThreadHeaderContainer.tsx'
import { MessageThreadKnowledge } from './components/MessageThreadKnowledge/MessageThreadKnowledge.tsx'
import './MessageThread.css'

export function MessageThread(): React.ReactElement {
  const { scrollContainerRef } = useMessageThreadContext()

  return (
    <div className={MESSAGE_THREAD_CLASS.thread}>
      <MessageThreadHeaderContainer />
      <MessageThreadKnowledge />
      <div className={MESSAGE_THREAD_CLASS.body} ref={scrollContainerRef}>
        <MessageThreadBodyContainer />
      </div>
      <MessageThreadComposerContainer />
    </div>
  )
}
