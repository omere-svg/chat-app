import { useEffect, useReducer, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { FORGOT_PASSWORD_ROUTE } from '@/app/constants/routes.ts'
import {
  RESET_CODE_PATTERN,
  RESET_PASSWORD_ERROR_CODE,
  RESET_PASSWORD_FAILURE_REASON,
  RESET_PASSWORD_TEXT,
} from '../ResetPasswordScreen.constants.ts'
import {
  initialResetPasswordState,
  resetPasswordReducer,
} from '../utils/resetPasswordReducer.ts'
import type { ResetPasswordFailureReason } from '../ResetPasswordScreen.types.ts'

function readEmail(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'email' in state) {
    const email = (state as { email: unknown }).email
    return typeof email === 'string' ? email : ''
  }
  return ''
}

function failureReasonFor(error: unknown): ResetPasswordFailureReason {
  if (error instanceof ApiError && error.code === RESET_PASSWORD_ERROR_CODE) {
    return RESET_PASSWORD_FAILURE_REASON.invalidCode
  }
  return RESET_PASSWORD_FAILURE_REASON.retryable
}

export function useResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = readEmail(location.state)

  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [state, dispatch] = useReducer(resetPasswordReducer, initialResetPasswordState)

  useEffect(() => {
    if (email.length === 0) {
      navigate(FORGOT_PASSWORD_ROUTE, { replace: true })
    }
  }, [email, navigate])

  const canSubmit =
    email.length > 0 && RESET_CODE_PATTERN.test(code.trim()) && newPassword.length > 0
  const areInputsDisabled = state.isSubmitting
  const isSubmitDisabled = !canSubmit || state.isSubmitting
  const submitLabel = state.isSubmitting
    ? RESET_PASSWORD_TEXT.submittingLabel
    : RESET_PASSWORD_TEXT.submitLabel

  async function submit(): Promise<void> {
    dispatch({ type: 'SUBMIT' })
    try {
      await apiClient.confirmPasswordReset({ email, code: code.trim(), newPassword })
      dispatch({ type: 'SUCCESS' })
    } catch (error) {
      dispatch({ type: 'ERROR', reason: failureReasonFor(error) })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (canSubmit && !state.isSubmitting) {
      void submit()
    }
  }

  return {
    code,
    newPassword,
    setCode,
    setNewPassword,
    status: state.status,
    areInputsDisabled,
    isSubmitDisabled,
    errorMessage:
      state.failureReason === null
        ? null
        : RESET_PASSWORD_TEXT.failure[state.failureReason],
    submitLabel,
    handleSubmit,
  }
}
