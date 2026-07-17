import type { KeyboardEvent } from 'react'
import type { UseComposerKeyDownParams } from '../MessageComposer.types.ts'

export function useComposerKeyDown({
  disabled,
  messageDraft,
  onSendMessage,
}: UseComposerKeyDownParams): (
  event: KeyboardEvent<HTMLTextAreaElement>,
) => void {
  return (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return
    if (disabled || !messageDraft.trim()) return
    event.preventDefault()
    onSendMessage()
  }
}
