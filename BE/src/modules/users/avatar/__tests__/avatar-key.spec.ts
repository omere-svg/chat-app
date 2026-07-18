import { describe, expect, it } from 'vitest'
import {
  buildAvatarKey,
  isAllowedAvatarContentType,
  isAvatarKeyOwnedBy,
} from '../avatar-key.js'

describe('avatar-key helpers', () => {
  it('accepts supported image content types', () => {
    expect(isAllowedAvatarContentType('image/jpeg')).toBe(true)
    expect(isAllowedAvatarContentType('image/png')).toBe(true)
    expect(isAllowedAvatarContentType('image/webp')).toBe(true)
  })

  it('rejects unsupported content types', () => {
    expect(isAllowedAvatarContentType('image/gif')).toBe(false)
    expect(isAllowedAvatarContentType('application/pdf')).toBe(false)
  })

  it('builds a namespaced key with the extension mapped from content type', () => {
    const key = buildAvatarKey('user-1', 'image/png')

    expect(key.startsWith('avatars/user-1/')).toBe(true)
    expect(key.endsWith('.png')).toBe(true)
  })

  it('generates a unique key per invocation', () => {
    expect(buildAvatarKey('user-1', 'image/jpeg')).not.toBe(
      buildAvatarKey('user-1', 'image/jpeg'),
    )
  })

  it('recognizes keys owned by the given user only', () => {
    expect(isAvatarKeyOwnedBy('user-1', 'avatars/user-1/photo.png')).toBe(true)
    expect(isAvatarKeyOwnedBy('user-1', 'avatars/user-2/photo.png')).toBe(false)
    expect(isAvatarKeyOwnedBy('user-1', 'documents/user-1/photo.png')).toBe(false)
  })
})
