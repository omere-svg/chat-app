import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'

export type UseNewConversationValue = {
  participantEmail: string
  setParticipantEmail: Dispatch<SetStateAction<string>>
  isSubmitting: boolean
  errorMessage: string | null
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  createAssistant: () => Promise<void>
  createTutor: () => Promise<void>
  isSubmitDisabled: boolean
  submitLabel: string
  assistantLabel: string
  tutorLabel: string
}

export type NewConversationProviderProps = {
  children: ReactNode
}
