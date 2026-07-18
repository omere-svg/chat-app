import { describe, expect, it, vi } from 'vitest'
import { RemoveAvatarOrchestrator } from '../remove-avatar.orchestrator.js'
import type { ObjectStorage } from '../../object-storage/types/object-storage.js'
import type { UsersService } from '../../users/users.service.js'
import type { PublicUser } from '../../users/types/user-public-view.js'

const CLEARED_USER: PublicUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
}

function buildOrchestrator(previousKey: string | null): {
  orchestrator: RemoveAvatarOrchestrator
  deleteObject: ReturnType<typeof vi.fn>
  clearAvatar: ReturnType<typeof vi.fn>
} {
  const deleteObject = vi.fn().mockResolvedValue(undefined)
  const objectStorage = { deleteObject } as unknown as ObjectStorage

  const clearAvatar = vi.fn().mockResolvedValue(CLEARED_USER)
  const usersService = {
    getAvatarKey: vi.fn().mockResolvedValue(previousKey),
    clearAvatar,
  } as unknown as UsersService

  return {
    orchestrator: new RemoveAvatarOrchestrator(objectStorage, usersService),
    deleteObject,
    clearAvatar,
  }
}

describe('RemoveAvatarOrchestrator', () => {
  it('clears the avatar and deletes the stored object when one exists', async () => {
    const { orchestrator, deleteObject, clearAvatar } = buildOrchestrator(
      'avatars/user-1/old.png',
    )

    const result = await orchestrator.remove('user-1')

    expect(clearAvatar).toHaveBeenCalledWith('user-1')
    expect(deleteObject).toHaveBeenCalledWith('avatars/user-1/old.png')
    expect(result).toEqual(CLEARED_USER)
  })

  it('is a no-op on storage when the user has no avatar', async () => {
    const { orchestrator, deleteObject, clearAvatar } = buildOrchestrator(null)

    await orchestrator.remove('user-1')

    expect(clearAvatar).toHaveBeenCalledWith('user-1')
    expect(deleteObject).not.toHaveBeenCalled()
  })
})
