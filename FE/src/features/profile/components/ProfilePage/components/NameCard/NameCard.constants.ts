export const NAME_CARD_TEXT = {
  title: 'Name',
  firstNameLabel: 'First name',
  lastNameLabel: 'Last name',
  save: 'Save name',
  saving: 'Saving…',
  success: 'Name updated.',
} as const

export const NAME_CARD_HEADING_ID = 'profile-name-heading'

export const NAME_FIELD = {
  firstName: { name: 'firstName', autoComplete: 'given-name', type: 'text' },
  lastName: { name: 'lastName', autoComplete: 'family-name', type: 'text' },
} as const
