import { describe, expect, it, vi } from 'vitest'
import { S3ObjectStorage } from '../s3-object-storage.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../../config/environment.types.js'

type SendableClient = { send: (command: unknown) => Promise<unknown> }

function buildStorage(): S3ObjectStorage {
  const values: Record<string, string> = {
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    S3_AVATAR_BUCKET: 'test-bucket',
    AWS_REGION: 'us-east-1',
  }
  const configService = {
    get: (key: string) => values[key],
  } as unknown as ConfigService<AppEnvironment, true>

  return new S3ObjectStorage(configService)
}

function spyOnSend(storage: S3ObjectStorage): ReturnType<typeof vi.spyOn> {
  const client = (storage as unknown as { client: SendableClient }).client
  return vi.spyOn(client, 'send')
}

describe('S3ObjectStorage.deleteObjectQuietly', () => {
  it('swallows storage errors instead of throwing', async () => {
    const storage = buildStorage()
    const send = spyOnSend(storage).mockRejectedValue(new Error('storage unavailable'))

    await expect(storage.deleteObjectQuietly('avatars/user-1')).resolves.toBeUndefined()
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('issues a single delete command for the key', async () => {
    const storage = buildStorage()
    const send = spyOnSend(storage).mockResolvedValue(undefined)

    await storage.deleteObjectQuietly('avatars/user-1')

    expect(send).toHaveBeenCalledTimes(1)
  })
})
