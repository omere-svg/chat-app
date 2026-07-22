import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { isValidEmail } from '@/shared/validation/isValidEmail.ts'
import { RESET_PASSWORD_ROUTE } from '@/app/constants/routes.ts'
import {
  FORGOT_PASSWORD_ERROR_FALLBACK,
  FORGOT_PASSWORD_TEXT,
} from '../ForgotPasswordScreen.constants.ts'

export function useRequestPasswordReset() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const canSubmit = isValidEmail(trimmedEmail)
  const areInputsDisabled = isSubmitting
  const isSubmitDisabled = !canSubmit || isSubmitting
  const submitLabel = isSubmitting
    ? FORGOT_PASSWORD_TEXT.submittingLabel
    : FORGOT_PASSWORD_TEXT.submitLabel

  async function submit(): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await apiClient.requestPasswordReset({ email: trimmedEmail })
      navigate(RESET_PASSWORD_ROUTE, { state: { email: trimmedEmail } })
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : FORGOT_PASSWORD_ERROR_FALLBACK)
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (canSubmit && !isSubmitting) {
      void submit()
    }
  }

  return {
    email,
    setEmail,
    areInputsDisabled,
    isSubmitDisabled,
    errorMessage,
    submitLabel,
    handleSubmit,
  }
}
