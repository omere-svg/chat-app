import type { AuthCopy, AuthMode } from './AuthScreen.types.ts'

export const AUTH_SCREEN_CLASS = {
  form: 'auth-screen',
  subtitle: 'auth-screen__subtitle',
} as const

export const AUTH_SCREEN_TEXT = {
  appTitle: 'Chat MVP',
} as const

export const AUTH_FIELD = {
  firstName: {
    label: 'First name',
    name: 'firstName',
    type: 'text',
    autoComplete: 'given-name',
  },
  lastName: {
    label: 'Last name',
    name: 'lastName',
    type: 'text',
    autoComplete: 'family-name',
  },
  email: { label: 'Email', name: 'email', type: 'email', autoComplete: 'email' },
  password: { label: 'Password', name: 'password', type: 'password' },
} as const

export const PASSWORD_AUTOCOMPLETE: Record<AuthMode, string> = {
  login: 'current-password',
  signup: 'new-password',
}

export const AUTH_ERROR_FALLBACK = 'Something went wrong. Please try again.'

export const AUTH_COPY: Record<AuthMode, AuthCopy> = {
  login: {
    title: 'Log in',
    submitLabel: 'Log in',
    switchPrompt: 'Need an account?',
    switchCta: 'Sign up',
  },
  signup: {
    title: 'Create your account',
    submitLabel: 'Sign up',
    switchPrompt: 'Already have an account?',
    switchCta: 'Log in',
  },
}
