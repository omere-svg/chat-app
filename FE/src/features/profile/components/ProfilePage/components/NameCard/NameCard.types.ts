import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import type { FormStatus } from '@/features/profile/types/formStatus.ts'

export type UseProfileNameValue = {
  firstName: string
  lastName: string
  setFirstName: Dispatch<SetStateAction<string>>
  setLastName: Dispatch<SetStateAction<string>>
  isSaving: boolean
  canSave: boolean
  status: FormStatus
  submitLabel: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type NameCardProps = {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  areInputsDisabled: boolean
  isSubmitDisabled: boolean
  submitLabel: string
  statusMessage: ReactNode
}
