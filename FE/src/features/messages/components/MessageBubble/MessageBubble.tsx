import { MessageCitationsContainer } from '../MessageCitations/MessageCitationsContainer.tsx'
import { useMessageBubbleContext } from './context/useMessageBubbleContext.tsx'
import { MessageBubbleAvatar } from './components/MessageBubbleAvatar/MessageBubbleAvatar.tsx'
import { MessageBubbleBody } from './components/MessageBubbleBody/MessageBubbleBody.tsx'
import { MessageMetaContainer } from './components/MessageMeta/MessageMetaContainer.tsx'
import { MessageToolsContainer } from './components/MessageTools/MessageToolsContainer.tsx'
import './MessageBubble.css'

export function MessageBubble(): React.ReactElement {
  const { rowClassName, bubbleClassName } = useMessageBubbleContext()

  return (
    <div className={rowClassName}>
      <MessageBubbleAvatar />
      <div className={bubbleClassName} data-testid="message-bubble">
        <MessageToolsContainer />
        <MessageBubbleBody />
        <MessageCitationsContainer />
        <MessageMetaContainer />
      </div>
    </div>
  )
}
