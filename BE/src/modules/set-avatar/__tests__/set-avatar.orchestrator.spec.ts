import { describe, expect, it, vi } from 'vitest'
import { SetAvatarOrchestrator } from '../set-avatar.orchestrator.js'
import { MAX_AVATAR_BYTES } from '../../users/avatar/constants.js'
import { AvatarKeyForbiddenError } from '../../users/avatar/errors/avatar-key-forbidden.error.js'
import { AvatarObjectNotFoundError } from '../../users/avatar/errors/avatar-object-not-found.error.js'
import { AvatarTooLargeError } from '../../users/avatar/errors/avatar-too-large.error.js'
import { UnsupportedImageTypeError } from '../../users/avatar/errors/unsupported-image-type.error.js'
import type { AvatarUrlResolver } from '../../users/avatar-url.resolver.js'
import type { ObjectStorage, StoredObject } from '../../object-storage/types/object-storage.js'
import type { UsersService } from '../../users/users.service.js'
import type { User } from '../../users/types/user.js'

const OWNED_KEY = 'avatars/user-1'
const RESOLVED_URL = 'https://cdn.example/avatars/user-1?v=1'

const UPDATED_USER: User = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: RESOLVED_URL,
}

function buildOrchestrator(storedObject: StoredObject | null): {
  orchestrator: SetAvatarOrchestrator
  headObject: ReturnType<typeof vi.fn>
  deleteObject: ReturnType<typeof vi.fn>
  updateAvatar: ReturnType<typeof vi.fn>
  resolve: ReturnType<typeof vi.fn>
} {
  const headObject = vi.fn().mockResolvedValue(storedObject)
  const deleteObject = vi.fn().mockResolvedValue(undefined)
  const objectStorage = { headObject, deleteObject } as unknown as ObjectStorage

  const updateAvatar = vi.fn().mockResolvedValue(UPDATED_USER)
  const usersService = { updateAvatar } as unknown as UsersService

  const resolve = vi.fn().mockReturnValue(RESOLVED_URL)
  const avatarUrlResolver = { resolve } as unknown as AvatarUrlResolver

  return {
    orchestrator: new SetAvatarOrchestrator(objectStorage, usersService, avatarUrlResolver),
    headObject,
    deleteObject,
    updateAvatar,
    resolve,
  }
}

describe('SetAvatarOrchestrator', () => {
  it('rejects a key that does not belong to the user without touching storage', async () => {
    const { orchestrator, headObject } = buildOrchestrator({
      contentType: 'image/png',
      byteSize: 10,
    })

    await expect(orchestrator.confirm('user-1', 'avatars/user-2')).rejects.toBeInstanceOf(
      AvatarKeyForbiddenError,
    )
    expect(headObject).not.toHaveBeenCalled()
  })

  it('rejects when the uploaded object is missing', async () => {
    const { orchestrator, updateAvatar } = buildOrchestrator(null)

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      AvatarObjectNotFoundError,
    )
    expect(updateAvatar).not.toHaveBeenCalled()
  })

  it('deletes the object and rejects when it exceeds the size limit', async () => {
    const { orchestrator, deleteObject, updateAvatar } = buildOrchestrator({
      contentType: 'image/png',
      byteSize: MAX_AVATAR_BYTES + 1,
    })

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      AvatarTooLargeError,
    )
    expect(deleteObject).toHaveBeenCalledWith(OWNED_KEY)
    expect(updateAvatar).not.toHaveBeenCalled()
  })

  it('deletes the object and rejects when the stored content type is unsupported', async () => {
    const { orchestrator, deleteObject } = buildOrchestrator({
      contentType: 'image/gif',
      byteSize: 10,
    })

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      UnsupportedImageTypeError,
    )
    expect(deleteObject).toHaveBeenCalledWith(OWNED_KEY)
  })

  it('resolves the url once at write time and stores the avatar without deleting', async () => {
    const { orchestrator, deleteObject, updateAvatar, resolve } = buildOrchestrator({
      contentType: 'image/png',
      byteSize: 2048,
    })

    const result = await orchestrator.confirm('user-1', OWNED_KEY)

    expect(resolve).toHaveBeenCalledWith(OWNED_KEY, expect.any(String))
    expect(updateAvatar).toHaveBeenCalledWith('user-1', { srcUrl: RESOLVED_URL, key: OWNED_KEY })
    expect(deleteObject).not.toHaveBeenCalled()
    expect(result).toEqual({ avatarUrl: RESOLVED_URL })
  })
})
