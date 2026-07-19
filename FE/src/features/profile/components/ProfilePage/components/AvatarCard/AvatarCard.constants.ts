export const AVATAR_CARD_TEXT = {
  title: 'Profile photo',
  uploadSuccess: 'Profile photo updated.',
  removeSuccess: 'Profile photo removed.',
  unsupportedType: 'Please choose a JPEG, PNG, or WebP image.',
  tooLarge: 'Image must be 5 MB or smaller.',
} as const

export const AVATAR_CARD_HEADING_ID = 'profile-avatar-heading'

export const ALLOWED_AVATAR_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export const AVATAR_CARD_CLASS = {
  preview: 'avatar-card__preview',
} as const
