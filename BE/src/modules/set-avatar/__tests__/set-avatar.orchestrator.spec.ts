import { describe, expect, it, vi } from 'vitest'
import { SetAvatarOrchestrator } from '../set-avatar.orchestrator.js'
import { MAX_AVATAR_BYTES } from '../../users/avatar/constants.js'
import { AvatarKeyForbiddenError } from '../../users/avatar/errors/avatar-key-forbidden.error.js'
import { AvatarObjectNotFoundError } from '../../users/avatar/errors/avatar-object-not-found.error.js'
import { AvatarTooLargeError } from '../../users/avatar/errors/avatar-too-large.error.js'
import { UnsupportedImageTypeError } from '../../users/avatar/errors/unsupported-image-type.error.js'
import type { ObjectStorage, StoredObject } from '../../object-storage/types/object-storage.js'
import type { UsersService } from '../../users/users.service.js'
import type { PublicUser } from '../../users/types/user-public-view.js'

const OWNED_KEY = 'avatars/user-1/new.png'

const UPDATED_USER: PublicUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: 'https://cdn.example/avatars/user-1/new.png',
}

function buildOrchestrator(options: {
  storedObject: StoredObject | null
  previousKey: string | null
}): {
  orchestrator: SetAvatarOrchestrator
  headObject: ReturnType<typeof vi.fn>
  deleteObject: ReturnType<typeof vi.fn>
  updateAvatar: ReturnType<typeof vi.fn>
} {
  const headObject = vi.fn().mockResolvedValue(options.storedObject)
  const deleteObject = vi.fn().mockResolvedValue(undefined)
  const objectStorage = { headObject, deleteObject } as unknown as ObjectStorage

  const updateAvatar = vi.fn().mockResolvedValue(UPDATED_USER)
  const usersService = {
    getAvatarKey: vi.fn().mockResolvedValue(options.previousKey),
    updateAvatar,
  } as unknown as UsersService

  return {
    orchestrator: new SetAvatarOrchestrator(objectStorage, usersService),
    headObject,
    deleteObject,
    updateAvatar,
  }
}

describe('SetAvatarOrchestrator', () => {
  it('rejects a key that does not belong to the user without touching storage', async () => {
    const { orchestrator, headObject } = buildOrchestrator({
      storedObject: { contentType: 'image/png', byteSize: 10 },
      previousKey: null,
    })

    await expect(
      orchestrator.confirm('user-1', 'avatars/user-2/theirs.png'),
    ).rejects.toBeInstanceOf(AvatarKeyForbiddenError)
    expect(headObject).not.toHaveBeenCalled()
  })

  it('rejects when the uploaded object is missing', async () => {
    const { orchestrator, updateAvatar } = buildOrchestrator({
      storedObject: null,
      previousKey: null,
    })

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      AvatarObjectNotFoundError,
    )
    expect(updateAvatar).not.toHaveBeenCalled()
  })

  it('deletes the object and rejects when it exceeds the size limit', async () => {
    const { orchestrator, deleteObject, updateAvatar } = buildOrchestrator({
      storedObject: { contentType: 'image/png', byteSize: MAX_AVATAR_BYTES + 1 },
      previousKey: null,
    })

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      AvatarTooLargeError,
    )
    expect(deleteObject).toHaveBeenCalledWith(OWNED_KEY)
    expect(updateAvatar).not.toHaveBeenCalled()
  })

  it('deletes the object and rejects when the stored content type is unsupported', async () => {
    const { orchestrator, deleteObject } = buildOrchestrator({
      storedObject: { contentType: 'image/gif', byteSize: 10 },
      previousKey: null,
    })

    await expect(orchestrator.confirm('user-1', OWNED_KEY)).rejects.toBeInstanceOf(
      UnsupportedImageTypeError,
    )
    expect(deleteObject).toHaveBeenCalledWith(OWNED_KEY)
  })

  it('persists the new key and removes the previous object', async () => {
    const { orchestrator, deleteObject, updateAvatar } = buildOrchestrator({
      storedObject: { contentType: 'image/png', byteSize: 2048 },
      previousKey: 'avatars/user-1/old.png',
    })

    const result = await orchestrator.confirm('user-1', OWNED_KEY)

    expect(updateAvatar).toHaveBeenCalledWith('user-1', OWNED_KEY)
    expect(deleteObject).toHaveBeenCalledWith('avatars/user-1/old.png')
    expect(result).toEqual(UPDATED_USER)
  })

  it('does not delete anything when there was no previous avatar', async () => {
    const { orchestrator, deleteObject } = buildOrchestrator({
      storedObject: { contentType: 'image/png', byteSize: 2048 },
      previousKey: null,
    })

    await orchestrator.confirm('user-1', OWNED_KEY)

    expect(deleteObject).not.toHaveBeenCalled()
  })
})
