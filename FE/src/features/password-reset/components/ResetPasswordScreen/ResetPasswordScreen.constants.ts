export const RESET_PASSWORD_CLASS = {
  screen: 'reset-password-screen',
  notice: 'reset-password-screen__notice',
  footer: 'reset-password-screen__footer',
  footerLink: 'reset-password-screen__footer-link',
} as const

export const RESET_PASSWORD_TEXT = {
  title: 'Enter your reset code',
  notice: 'If that account exists, a reset code has been sent to the email address.',
  submitLabel: 'Reset password',
  submittingLabel: 'Resetting password…',
  successTitle: 'Password updated',
  successMessage: 'Your password has been reset. Please log in with your new password.',
  backToLogin: 'Back to log in',
  failure: {
    'invalid-code':
      'That reset code is invalid or has expired. Request a new one and try again.',
    retryable: 'We could not reset your password. Please try again.',
  },
} as const

export const RESET_PASSWORD_FAILURE_REASON = {
  invalidCode: 'invalid-code',
  retryable: 'retryable',
} as const

export const RESET_CODE_LENGTH = 6

export const RESET_CODE_PATTERN = new RegExp(`^\\d{${RESET_CODE_LENGTH.toString()}}$`)

export const RESET_PASSWORD_ERROR_CODE = 'PASSWORD_RESET_CODE_INVALID'
