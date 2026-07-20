export const BCRYPT_SALT_ROUNDS = 12

export const MAX_PREVIOUS_EMAILS = 10

export const USER_COLLECTION_NAME = 'users'

export const USER_EMAIL_INDEX_NAME = 'users_email_unique_ci'

export const LEGACY_USER_EMAIL_INDEX_NAME = 'email_1'

export const USER_EMAIL_COLLATION = {
  locale: 'en',
  caseLevel: false,
  caseFirst: 'off',
  strength: 2,
  numericOrdering: false,
  alternate: 'non-ignorable',
  maxVariable: 'punct',
  backwards: false,
  normalization: false,
} as const
