export const RESET_PASSWORD_FORM_CLASS = {
  form: 'reset-password-form',
} as const

export const RESET_PASSWORD_FIELD = {
  code: {
    label: 'Reset code',
    name: 'code',
    type: 'text',
    autoComplete: 'one-time-code',
  },
  newPassword: {
    label: 'New password',
    name: 'newPassword',
    type: 'password',
    autoComplete: 'new-password',
  },
} as const
