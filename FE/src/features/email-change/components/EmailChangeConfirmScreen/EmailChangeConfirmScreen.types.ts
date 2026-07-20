import type { ReactNode } from 'react'
import { EMAIL_CHANGE_CONFIRM_FAILURE_REASON } from './EmailChangeConfirmScreen.constants.ts'

export type EmailChangeConfirmFailureReason =
  (typeof EMAIL_CHANGE_CONFIRM_FAILURE_REASON)[keyof typeof EMAIL_CHANGE_CONFIRM_FAILURE_REASON]

export type ConfirmEmailChangeState =
  | {
      status: 'pending'
      newEmail: ''
      failureReason: null
    }
  | {
      status: 'success'
      newEmail: string
      failureReason: null
    }
  | {
      status: 'invalid'
      newEmail: ''
      failureReason: EmailChangeConfirmFailureReason
    }

export type ConfirmEmailChangeAction =
  | { type: 'PENDING' }
  | { type: 'SUCCESS'; newEmail: string }
  | { type: 'INVALID'; reason: EmailChangeConfirmFailureReason }

export type EmailChangeConfirmScreenProps = {
  children: ReactNode
}

export type EmailChangeConfirmProviderProps = {
  children: ReactNode
}
