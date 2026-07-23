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
  isSubmitDisabled: boolean
  submitLabel: string
  passwordAutoComplete: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  toggleMode: () => void
}

export type AuthScreenProviderProps = {
  children: ReactNode
}
