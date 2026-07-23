import type { ChangeEvent, FormEvent, ReactNode } from 'react'

export type UseNewConversationValue = {
  participantEmail: string
  handleParticipantEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  isSubmitting: boolean
  errorMessage: string | null
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleCreateAssistant: () => void
  handleCreateTutor: () => void
  isSubmitDisabled: boolean
  submitLabel: string
  assistantLabel: string
  tutorLabel: string
}

export type NewConversationProviderProps = {
  children: ReactNode
}
