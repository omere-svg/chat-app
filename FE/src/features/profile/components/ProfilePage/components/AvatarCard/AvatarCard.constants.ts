export const AVATAR_CARD_TEXT = {
  title: 'Profile photo',
  upload: 'Upload new photo',
  uploading: 'Uploading…',
  remove: 'Remove photo',
  removing: 'Removing…',
  uploadSuccess: 'Profile photo updated.',
  removeSuccess: 'Profile photo removed.',
  unsupportedType: 'Please choose a JPEG, PNG, or WebP image.',
  tooLarge: 'Image must be 5 MB or smaller.',
} as const

export const AVATAR_CARD_HEADING_ID = 'profile-avatar-heading'

export const AVATAR_CARD_INPUT_ID = 'profile-avatar-input'

export const ALLOWED_AVATAR_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export const AVATAR_CARD_CLASS = {
  preview: 'avatar-card__preview',
  controls: 'avatar-card__controls',
  uploadLabel: 'btn btn--primary avatar-card__upload',
  fileInput: 'avatar-card__file-input',
} as const
