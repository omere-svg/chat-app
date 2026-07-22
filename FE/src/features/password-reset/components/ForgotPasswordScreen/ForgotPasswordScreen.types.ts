import type { FormEvent, ReactNode } from 'react'

export type ForgotPasswordScreenProps = {
  email: string
  areInputsDisabled: boolean
  isSubmitDisabled: boolean
  submitLabel: string
  errorMessage: ReactNode
  backToLoginLink: ReactNode
  onEmailChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type UseRequestPasswordResetValue = {
  email: string
  setEmail: (value: string) => void
  isSubmitting: boolean
  errorMessage: string | null
  canSubmit: boolean
  submitLabel: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}
