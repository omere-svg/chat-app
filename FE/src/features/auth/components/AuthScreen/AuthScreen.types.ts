import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'

export type AuthMode = 'login' | 'signup'

export type AuthCopy = {
  title: string
  submitLabel: string
  switchPrompt: string
  switchCta: string
}

export type UseAuthScreenValue = {
  isSignup: boolean
  subtitle: string
  copy: AuthCopy
  email: string
  password: string
  firstName: string
  lastName: string
  setEmail: Dispatch<SetStateAction<string>>
  setPassword: Dispatch<SetStateAction<string>>
  setFirstName: Dispatch<SetStateAction<string>>
  setLastName: Dispatch<SetStateAction<string>>
  isSubmitting: boolean
  errorMessage: string | null
  canSubmit: boolean
  submitLabel: string
  passwordAutoComplete: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  toggleMode: () => void
}

export type AuthScreenProps = {
  subtitle: string
  nameFields: ReactNode
  email: string
  password: string
  passwordAutoComplete: string
  areInputsDisabled: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  forgotPasswordLink: ReactNode
  errorMessage: ReactNode
  submitLabel: string
  isSubmitDisabled: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  modeSwitch: ReactNode
}
