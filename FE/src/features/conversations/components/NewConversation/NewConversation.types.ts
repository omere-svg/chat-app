import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'

export type NewConversationFormContainerProps = {
  onConversationCreated: (conversationId: string) => void
}

export type UseNewConversationValue = {
  participantEmail: string
  setParticipantEmail: Dispatch<SetStateAction<string>>
  isSubmitting: boolean
  errorMessage: string | null
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  createAssistant: () => Promise<void>
  createTutor: () => Promise<void>
}

export type NewConversationFormProps = {
  participantEmail: string
  isSubmitting: boolean
  isSubmitDisabled: boolean
  submitLabel: string
  errorMessage: ReactNode
  onParticipantEmailChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type NewConversationActionsProps = {
  disabled: boolean
  assistantLabel: string
  tutorLabel: string
  onCreateAssistant: () => void
  onCreateTutor: () => void
}

export type NewConversationErrorProps = {
  message: string
}
