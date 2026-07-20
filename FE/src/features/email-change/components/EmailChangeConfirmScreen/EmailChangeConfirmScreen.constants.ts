export const EMAIL_CHANGE_CONFIRM_FAILURE_REASON = {
  tokenInvalid: 'token-invalid',
  emailTaken: 'email-taken',
  retryable: 'retryable',
} as const

export const EMAIL_CHANGE_CONFIRM_TEXT = {
  heading: 'Confirm email change',
  pending: 'Confirming your new email address…',
  successPrefix: 'Your email address is now ',
  failure: {
    'token-invalid':
      'This confirmation link is invalid or has expired. Please request the change again.',
    'email-taken':
      'This email address is no longer available. Please choose another email address.',
    retryable: 'We could not confirm your email address. Please try again.',
  },
  backToProfile: 'Back to profile',
} as const

export const CONFIRM_EMAIL_TOKEN_PARAM = 'token'

export const EMAIL_CHANGE_CONFIRM_CLASS = {
  screen: 'email-change-confirm-screen',
  card: 'email-change-confirm-screen__card',
  heading: 'email-change-confirm-screen__heading',
} as const
