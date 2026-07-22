export const FORGOT_PASSWORD_CLASS = {
  screen: 'forgot-password-screen',
  form: 'forgot-password-form',
  subtitle: 'forgot-password-screen__subtitle',
  footer: 'forgot-password-screen__footer',
  footerLink: 'forgot-password-screen__footer-link',
} as const

export const FORGOT_PASSWORD_TEXT = {
  title: 'Reset your password',
  subtitle: "Enter your account email and we'll send you a reset code.",
  submitLabel: 'Send reset code',
  submittingLabel: 'Sending reset code…',
  backToLogin: 'Back to log in',
} as const

export const FORGOT_PASSWORD_FIELD = {
  email: { label: 'Email', name: 'email', type: 'email', autoComplete: 'email' },
} as const

export const FORGOT_PASSWORD_ERROR_FALLBACK = 'Something went wrong. Please try again.'
