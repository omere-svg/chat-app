import { describe, expect, it, vi } from 'vitest'
import { RemoveAvatarOrchestrator } from '../remove-avatar.orchestrator.js'
import type { ObjectStorage } from '../../object-storage/types/object-storage.js'
import type { UsersService } from '../../users/users.service.js'
import type { User } from '../../users/types/user.js'
import type { UserRecord } from '../../users/types/user.entity.js'

const CLEARED_USER: User = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
}

function buildUserRecord(previousKey: string | null): UserRecord {
  return {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'hashed',
    firstName: 'Ada',
    lastName: 'Lovelace',
    avatar: previousKey === null ? null : { srcUrl: null, key: previousKey },
  }
}

function buildOrchestrator(previousKey: string | null): {
  orchestrator: RemoveAvatarOrchestrator
  deleteObjectQuietly: ReturnType<typeof vi.fn>
  clearAvatar: ReturnType<typeof vi.fn>
} {
  const deleteObjectQuietly = vi.fn().mockResolvedValue(undefined)
  const objectStorage = { deleteObjectQuietly } as unknown as ObjectStorage

  const clearAvatar = vi.fn().mockResolvedValue(CLEARED_USER)
  const usersService = {
    getUserRecord: vi.fn().mockResolvedValue(buildUserRecord(previousKey)),
    clearAvatar,
  } as unknown as UsersService

  return {
    orchestrator: new RemoveAvatarOrchestrator(objectStorage, usersService),
    deleteObjectQuietly,
    clearAvatar,
  }
}

describe('RemoveAvatarOrchestrator', () => {
  it('clears the avatar and deletes the stored object when one exists', async () => {
    const { orchestrator, deleteObjectQuietly, clearAvatar } = buildOrchestrator('avatars/user-1')

    const result = await orchestrator.remove('user-1')

    expect(clearAvatar).toHaveBeenCalledWith('user-1')
    expect(deleteObjectQuietly).toHaveBeenCalledWith('avatars/user-1')
    expect(result).toEqual({ avatarUrl: null })
  })

  it('is a no-op on storage when the user has no avatar', async () => {
    const { orchestrator, deleteObjectQuietly, clearAvatar } = buildOrchestrator(null)

    await orchestrator.remove('user-1')

    expect(clearAvatar).toHaveBeenCalledWith('user-1')
    expect(deleteObjectQuietly).not.toHaveBeenCalled()
  })
})
