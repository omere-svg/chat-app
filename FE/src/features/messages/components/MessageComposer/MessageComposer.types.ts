export type MessageComposerProps = {
  messageDraft: string
  onMessageDraftChange: (messageDraft: string) => void
  onSendMessage: () => void
  disabled?: boolean
}

export type UseComposerKeyDownParams = {
  disabled: boolean
  messageDraft: string
  onSendMessage: () => void
}
