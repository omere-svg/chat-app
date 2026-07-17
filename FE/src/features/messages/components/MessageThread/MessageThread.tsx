import { MESSAGE_THREAD_CLASS } from './MessageThread.constants.ts'
import type { MessageThreadProps } from './MessageThread.types.ts'
import './MessageThread.css'

export function MessageThread({
  header,
  knowledgePanel,
  body,
  composer,
  scrollContainerRef,
}: MessageThreadProps): React.ReactElement {
  return (
    <div className={MESSAGE_THREAD_CLASS.thread}>
      {header}
      {knowledgePanel}
      <div className={MESSAGE_THREAD_CLASS.body} ref={scrollContainerRef}>
        {body}
      </div>
      {composer}
    </div>
  )
}
