export const AVATAR_KEY_PREFIX = 'avatars'

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export const ALLOWED_AVATAR_CONTENT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const
