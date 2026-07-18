import { randomUUID } from 'node:crypto'
import { ALLOWED_AVATAR_CONTENT_TYPES, AVATAR_KEY_PREFIX } from './constants.js'
import type { AllowedAvatarContentType } from './types/allowed-avatar-content-type.js'

export function isAllowedAvatarContentType(
  contentType: string,
): contentType is AllowedAvatarContentType {
  return Object.prototype.hasOwnProperty.call(ALLOWED_AVATAR_CONTENT_TYPES, contentType)
}

export function buildAvatarKey(userId: string, contentType: AllowedAvatarContentType): string {
  const extension = ALLOWED_AVATAR_CONTENT_TYPES[contentType]
  return `${AVATAR_KEY_PREFIX}/${userId}/${randomUUID()}.${extension}`
}

export function isAvatarKeyOwnedBy(userId: string, key: string): boolean {
  return key.startsWith(`${AVATAR_KEY_PREFIX}/${userId}/`)
}
