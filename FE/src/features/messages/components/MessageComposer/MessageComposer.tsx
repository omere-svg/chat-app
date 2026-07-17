import { Button } from '@/shared/components/Button/Button.tsx'
import { useComposerKeyDown } from './hooks/useComposerKeyDown.ts'
import {
  MESSAGE_COMPOSER_CLASS,
  MESSAGE_COMPOSER_ROWS,
  MESSAGE_COMPOSER_TEXT,
} from './MessageComposer.constants.ts'
import type { MessageComposerProps } from './MessageComposer.types.ts'
import './MessageComposer.css'

export function MessageComposer({
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  disabled = false,
}: MessageComposerProps): React.ReactElement {
  const handleKeyDown = useComposerKeyDown({
    disabled,
    messageDraft,
    onSendMessage,
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
        disabled={disabled}
        aria-label={MESSAGE_COMPOSER_TEXT.inputAriaLabel}
      />
      <Button
        variant="primary"
        disabled={disabled || !messageDraft.trim()}
        onClick={onSendMessage}
      >
        {MESSAGE_COMPOSER_TEXT.send}
      </Button>
    </div>
  )
}
