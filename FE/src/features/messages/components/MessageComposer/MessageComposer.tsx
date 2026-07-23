import { Button } from '@/shared/components/Button/Button.tsx'
import { useMessageThreadContext } from '../MessageThread/context/useMessageThreadContext.tsx'
import { useComposerKeyDown } from './hooks/useComposerKeyDown.ts'
import {
  MESSAGE_COMPOSER_CLASS,
  MESSAGE_COMPOSER_ROWS,
  MESSAGE_COMPOSER_TEXT,
} from './MessageComposer.constants.ts'
import './MessageComposer.css'

export function MessageComposer(): React.ReactElement {
  const {
    messageDraft,
    onMessageDraftChange,
    handleSendMessage,
    isComposerDisabled,
    isSendDisabled,
  } = useMessageThreadContext()

  const handleKeyDown = useComposerKeyDown({
    disabled: isComposerDisabled,
    messageDraft,
    onSendMessage: handleSendMessage,
  })

  return (
    <div className={MESSAGE_COMPOSER_CLASS.root}>
      <textarea
        className={MESSAGE_COMPOSER_CLASS.input}
        value={messageDraft}
        onChange={(event) => onMessageDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={MESSAGE_COMPOSER_TEXT.placeholder}
        rows={MESSAGE_COMPOSER_ROWS}
        disabled={isComposerDisabled}
        aria-label={MESSAGE_COMPOSER_TEXT.inputAriaLabel}
      />
      <Button
        variant="primary"
        disabled={isSendDisabled}
        onClick={handleSendMessage}
      >
        {MESSAGE_COMPOSER_TEXT.send}
      </Button>
    </div>
  )
}
