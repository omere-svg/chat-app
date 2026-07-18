import { describe, expect, it, vi } from 'vitest'
import { RequestAvatarUploadOrchestrator } from '../request-avatar-upload.orchestrator.js'
import { UnsupportedImageTypeError } from '../../users/avatar/errors/unsupported-image-type.error.js'
import type { ObjectStorage } from '../../object-storage/types/object-storage.js'

function buildOrchestrator(): {
  orchestrator: RequestAvatarUploadOrchestrator
  createUploadUrl: ReturnType<typeof vi.fn>
} {
  const createUploadUrl = vi
    .fn()
    .mockResolvedValue({ uploadUrl: 'https://storage.example/upload', expiresInSeconds: 300 })
  const objectStorage = { createUploadUrl } as unknown as ObjectStorage
  return { orchestrator: new RequestAvatarUploadOrchestrator(objectStorage), createUploadUrl }
}

describe('RequestAvatarUploadOrchestrator', () => {
  it('returns an upload ticket with an owned key for a supported type', async () => {
    const { orchestrator, createUploadUrl } = buildOrchestrator()

    const ticket = await orchestrator.prepare('user-1', 'image/png')

    expect(ticket.key.startsWith('avatars/user-1/')).toBe(true)
    expect(ticket.key.endsWith('.png')).toBe(true)
    expect(ticket.uploadUrl).toBe('https://storage.example/upload')
    expect(ticket.expiresInSeconds).toBe(300)
    expect(createUploadUrl).toHaveBeenCalledWith({ key: ticket.key, contentType: 'image/png' })
  })

  it('rejects an unsupported content type before signing a URL', async () => {
    const { orchestrator, createUploadUrl } = buildOrchestrator()

    await expect(orchestrator.prepare('user-1', 'image/gif')).rejects.toBeInstanceOf(
      UnsupportedImageTypeError,
    )
    expect(createUploadUrl).not.toHaveBeenCalled()
  })
})
