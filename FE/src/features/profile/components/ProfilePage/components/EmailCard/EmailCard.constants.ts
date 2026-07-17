export const EMAIL_CARD_TEXT = {
  title: 'Email address',
  emailLabel: 'Email',
  passwordLabel: 'Current password',
  save: 'Save email',
  saving: 'Saving…',
  success: 'Email updated.',
} as const

export const EMAIL_CARD_HEADING_ID = 'profile-email-heading'

export const EMAIL_FIELD = {
  email: { name: 'email', autoComplete: 'email', type: 'email' },
  currentPassword: {
    name: 'currentPassword',
    autoComplete: 'current-password',
    type: 'password',
  },
} as const
