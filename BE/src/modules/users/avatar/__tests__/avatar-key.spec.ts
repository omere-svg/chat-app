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

  it('builds a fixed, server-derived key scoped to the user', () => {
    expect(buildAvatarKey('user-1')).toBe('avatars/user-1')
  })

  it('returns the same key on every invocation for a user', () => {
    expect(buildAvatarKey('user-1')).toBe(buildAvatarKey('user-1'))
  })

  it('recognizes the fixed key owned by the given user only', () => {
    expect(isAvatarKeyOwnedBy('user-1', 'avatars/user-1')).toBe(true)
    expect(isAvatarKeyOwnedBy('user-1', 'avatars/user-2')).toBe(false)
    expect(isAvatarKeyOwnedBy('user-1', 'avatars/user-1/photo.png')).toBe(false)
    expect(isAvatarKeyOwnedBy('user-1', 'documents/user-1')).toBe(false)
  })
})
