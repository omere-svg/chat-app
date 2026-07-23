import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import {
  AUTH_COPY,
  AUTH_ERROR_FALLBACK,
  PASSWORD_AUTOCOMPLETE,
} from '../AuthScreen.constants.ts'
import type { AuthMode, UseAuthScreenValue } from '../AuthScreen.types.ts'

export function useAuthScreen(): UseAuthScreenValue {
  const { login, signup } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const copy = AUTH_COPY[mode]
  const isSignup = mode === 'signup'
  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (!isSignup || (firstName.trim().length > 0 && lastName.trim().length > 0))
  const isSubmitDisabled = !canSubmit || isSubmitting
  const submitLabel = isSubmitting ? `${copy.submitLabel}…` : copy.submitLabel
  const passwordAutoComplete = PASSWORD_AUTOCOMPLETE[mode]

  function toggleMode(): void {
    setMode((previousMode) => (previousMode === 'signup' ? 'login' : 'signup'))
    setErrorMessage(null)
  }

  async function submit(): Promise<void> {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      if (isSignup) {
        await signup(email.trim(), password, firstName.trim(), lastName.trim())
      } else {
        await login(email.trim(), password)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : AUTH_ERROR_FALLBACK,
      )
    } finally {
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
    isSignup,
    copy,
    email,
    password,
    firstName,
    lastName,
    setEmail,
    setPassword,
    setFirstName,
    setLastName,
    isSubmitting,
    errorMessage,
    isSubmitDisabled,
    submitLabel,
    passwordAutoComplete,
    handleSubmit,
    toggleMode,
  }
}
