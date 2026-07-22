import type { FormEvent, ReactNode } from 'react'

export type ResetPasswordFormProps = {
  code: string
  newPassword: string
  areInputsDisabled: boolean
  isSubmitDisabled: boolean
  submitLabel: string
  errorMessage: ReactNode
  backToLoginLink: ReactNode
  onCodeChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}
