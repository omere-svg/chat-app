import type { FormEvent } from 'react'
import type { ResetPasswordStatus } from '../ResetPasswordScreen.types.ts'

export type UseResetPasswordValue = {
  code: string
  newPassword: string
  setCode: (value: string) => void
  setNewPassword: (value: string) => void
  status: ResetPasswordStatus
  isSubmitting: boolean
  errorMessage: string | null
  canSubmit: boolean
  submitLabel: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}
