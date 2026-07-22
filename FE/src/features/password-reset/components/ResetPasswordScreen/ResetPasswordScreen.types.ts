import type { ReactNode } from 'react'
import { RESET_PASSWORD_FAILURE_REASON } from './ResetPasswordScreen.constants.ts'

export type ResetPasswordStatus = 'editing' | 'success'

export type ResetPasswordFailureReason =
  (typeof RESET_PASSWORD_FAILURE_REASON)[keyof typeof RESET_PASSWORD_FAILURE_REASON]

export type ResetPasswordState = {
  status: ResetPasswordStatus
  isSubmitting: boolean
  failureReason: ResetPasswordFailureReason | null
}

export type ResetPasswordAction =
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; reason: ResetPasswordFailureReason }

export type ResetPasswordScreenProps = {
  children: ReactNode
}

export type ResetPasswordProviderProps = {
  children: ReactNode
}
