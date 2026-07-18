import { describe, expect, it, vi } from 'vitest'
import { RequestAvatarUploadOrchestrator } from '../request-avatar-upload.orchestrator.js'
import { MAX_AVATAR_BYTES } from '../../users/avatar/constants.js'
import { UnsupportedImageTypeError } from '../../users/avatar/errors/unsupported-image-type.error.js'
import type { ObjectStorage } from '../../object-storage/types/object-storage.js'

function buildOrchestrator(): {
  orchestrator: RequestAvatarUploadOrchestrator
  createUploadUrl: ReturnType<typeof vi.fn>
} {
  const createUploadUrl = vi.fn().mockResolvedValue({
    url: 'https://storage.example/upload',
    fields: { key: 'avatars/user-1', 'Content-Type': 'image/png' },
    expiresInSeconds: 300,
  })
  const objectStorage = { createUploadUrl } as unknown as ObjectStorage
  return { orchestrator: new RequestAvatarUploadOrchestrator(objectStorage), createUploadUrl }
}

describe('RequestAvatarUploadOrchestrator', () => {
  it('returns a presigned POST ticket with the fixed owned key for a supported type', async () => {
    const { orchestrator, createUploadUrl } = buildOrchestrator()

    const ticket = await orchestrator.prepare('user-1', 'image/png')

    expect(ticket.key).toBe('avatars/user-1')
    expect(ticket.url).toBe('https://storage.example/upload')
    expect(ticket.fields).toEqual({ key: 'avatars/user-1', 'Content-Type': 'image/png' })
    expect(ticket.expiresInSeconds).toBe(300)
    expect(createUploadUrl).toHaveBeenCalledWith({
      key: 'avatars/user-1',
      contentType: 'image/png',
      maxBytes: MAX_AVATAR_BYTES,
    })
  })

  it('rejects an unsupported content type before signing a URL', async () => {
    const { orchestrator, createUploadUrl } = buildOrchestrator()

    await expect(orchestrator.prepare('user-1', 'image/gif')).rejects.toBeInstanceOf(
      UnsupportedImageTypeError,
    )
    expect(createUploadUrl).not.toHaveBeenCalled()
  })
})
