import { ALLOWED_AVATAR_CONTENT_TYPES, AVATAR_KEY_PREFIX } from './constants.js'
import type { AllowedAvatarContentType } from './types/allowed-avatar-content-type.js'

export function isAllowedAvatarContentType(
  contentType: string,
): contentType is AllowedAvatarContentType {
  return Object.prototype.hasOwnProperty.call(ALLOWED_AVATAR_CONTENT_TYPES, contentType)
}

export function buildAvatarKey(userId: string): string {
  return `${AVATAR_KEY_PREFIX}/${userId}`
}

export function isAvatarKeyOwnedBy(userId: string, key: string): boolean {
  return key === buildAvatarKey(userId)
}
