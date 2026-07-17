import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import type { FormStatus } from '@/features/profile/types/formStatus.ts'

export type UseProfileEmailValue = {
  email: string
  currentPassword: string
  setEmail: Dispatch<SetStateAction<string>>
  setCurrentPassword: Dispatch<SetStateAction<string>>
  isSaving: boolean
  canSave: boolean
  status: FormStatus
  submitLabel: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type EmailCardProps = {
  email: string
  currentPassword: string
  onEmailChange: (value: string) => void
  onCurrentPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  areInputsDisabled: boolean
  isSubmitDisabled: boolean
  submitLabel: string
  statusMessage: ReactNode
}
