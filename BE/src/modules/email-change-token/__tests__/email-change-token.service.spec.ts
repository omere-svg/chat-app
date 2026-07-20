import { describe, expect, it } from 'vitest'
import { EmailChangeTokenService } from '../email-change-token.service.js'
import { EmailChangeTokenInvalidError } from '../errors/email-change-token-invalid.error.js'

const SECRET = 'email-change-secret-at-least-32-characters-long'

function buildService(options?: { secret?: string; expiresIn?: number }): EmailChangeTokenService {
  return new EmailChangeTokenService(options?.secret ?? SECRET, options?.expiresIn ?? 1800)
}

describe('EmailChangeTokenService', () => {
  it('round-trips the userId and newEmail claims', async () => {
    const service = buildService()
    const token = await service.issue({ userId: 'user-1', newEmail: 'new@example.com' })

    await expect(service.verify(token)).resolves.toEqual({
      userId: 'user-1',
      newEmail: 'new@example.com',
    })
  })

  it('rejects a tampered token', async () => {
    const service = buildService()
    const token = await service.issue({ userId: 'user-1', newEmail: 'new@example.com' })

    await expect(service.verify(`${token}tampered`)).rejects.toBeInstanceOf(
      EmailChangeTokenInvalidError,
    )
  })

  it('rejects an expired token', async () => {
    const service = buildService({ expiresIn: -10 })
    const token = await service.issue({ userId: 'user-1', newEmail: 'new@example.com' })

    await expect(service.verify(token)).rejects.toBeInstanceOf(EmailChangeTokenInvalidError)
  })

  it('rejects a token signed with a different secret', async () => {
    const foreignService = buildService({ secret: 'a-totally-different-secret-32-characters!!' })
    const token = await foreignService.issue({ userId: 'user-1', newEmail: 'new@example.com' })

    await expect(buildService().verify(token)).rejects.toBeInstanceOf(
      EmailChangeTokenInvalidError,
    )
  })

  it.each([undefined, '', 123])('rejects malformed token %j with the token error', async (token) => {
    const service = buildService()

    await expect(service.verify(token)).rejects.toBeInstanceOf(EmailChangeTokenInvalidError)
  })
})
