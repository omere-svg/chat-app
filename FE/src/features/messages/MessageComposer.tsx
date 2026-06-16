import type { KeyboardEvent } from 'react'

type MessageComposerProps = {
  messageDraft: string
  onMessageDraftChange: (messageDraft: string) => void
  onSendMessage: () => void
  disabled?: boolean
}

export function MessageComposer({
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  disabled = false,
}: MessageComposerProps): React.ReactElement {
  function handleMessageDraftKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return
    if (disabled || !messageDraft.trim()) return
    event.preventDefault()
    onSendMessage()
  }

  return (
    <div className="message-composer">
      <textarea
        className="message-composer__input"
        value={messageDraft}
        onChange={(event) => onMessageDraftChange(event.target.value)}
        onKeyDown={handleMessageDraftKeyDown}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={3}
        disabled={disabled}
        aria-label="Message input"
      />
      <button
        type="button"
        className="btn btn--primary"
        onClick={onSendMessage}
        disabled={disabled || !messageDraft.trim()}
      >
        Send
      </button>
    </div>
  )
}
