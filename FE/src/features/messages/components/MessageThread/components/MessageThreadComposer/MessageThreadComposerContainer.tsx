import { MessageComposer } from '../../../MessageComposer/MessageComposer.tsx'
import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'

export function MessageThreadComposerContainer(): React.ReactElement | null {
  const {
    isReady,
    messageDraft,
    onMessageDraftChange,
    handleSendMessage,
    isComposerDisabled,
  } = useMessageThreadContext()

  if (!isReady) {
    return null
  }

  return (
    <MessageComposer
      messageDraft={messageDraft}
      onMessageDraftChange={onMessageDraftChange}
      onSendMessage={handleSendMessage}
      disabled={isComposerDisabled}
    />
  )
}
