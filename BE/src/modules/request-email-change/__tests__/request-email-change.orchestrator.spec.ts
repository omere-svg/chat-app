import { describe, expect, it, vi } from 'vitest'
import { RequestEmailChangeOrchestrator } from '../request-email-change.orchestrator.js'
import { EmailUnchangedError } from '../errors/email-unchanged.error.js'
import { EmailAlreadyRegisteredError } from '../../users/errors/email-already-registered.error.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../../config/environment.types.js'
import type { EmailSender } from '../../email-sender/types/email-sender.js'
import type { EmailChangeTokenService } from '../../email-change-token/email-change-token.service.js'
import type { UsersService } from '../../users/users.service.js'
import type { UserRecord } from '../../users/types/user.entity.js'

const CURRENT_USER: UserRecord = {
  id: 'user-1',
  email: 'old@example.com',
  passwordHash: 'hash',
  firstName: 'Old',
  lastName: 'Name',
  avatar: null,
  previousEmails: [],
}

function buildOrchestrator(overrides?: {
  assertEmailAvailable?: () => Promise<void>
  currentUser?: UserRecord
}): {
  orchestrator: RequestEmailChangeOrchestrator
  assertEmailAvailable: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
  issue: ReturnType<typeof vi.fn>
} {
  const getUserRecord = vi.fn().mockResolvedValue(overrides?.currentUser ?? CURRENT_USER)
  const assertEmailAvailable = vi
    .fn()
    .mockImplementation(overrides?.assertEmailAvailable ?? (() => Promise.resolve()))
  const usersService = { getUserRecord, assertEmailAvailable } as unknown as UsersService

  const issue = vi.fn().mockResolvedValue('signed-token')
  const emailChangeTokenService = { issue } as unknown as EmailChangeTokenService

  const send = vi.fn().mockResolvedValue(undefined)
  const emailSender: EmailSender = { send }

  const configService = {
    get: () => 'http://localhost:5173',
  } as unknown as ConfigService<AppEnvironment, true>

  return {
    orchestrator: new RequestEmailChangeOrchestrator(
      usersService,
      emailChangeTokenService,
      emailSender,
      configService,
    ),
    assertEmailAvailable,
    send,
    issue,
  }
}

describe('RequestEmailChangeOrchestrator', () => {
  it('issues a token and emails a confirmation link carrying it', async () => {
    const { orchestrator, send, issue } = buildOrchestrator()

    const result = await orchestrator.request('user-1', { newEmail: 'New@Example.com' })

    expect(result).toEqual({ status: 'confirmation_sent' })
    expect(issue).toHaveBeenCalledWith({ userId: 'user-1', newEmail: 'new@example.com' })
    const message = send.mock.calls[0]?.[0] as { to: string; textBody: string; htmlBody: string }
    expect(message.to).toBe('new@example.com')
    expect(message.textBody).toContain('http://localhost:5173/confirm-email?token=signed-token')
    expect(message.htmlBody).toContain('signed-token')
  })

  it('rejects changing to the current email without sending anything', async () => {
    const { orchestrator, send } = buildOrchestrator()

    await expect(
      orchestrator.request('user-1', { newEmail: 'old@example.com' }),
    ).rejects.toBeInstanceOf(EmailUnchangedError)
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a normalized request matching a mixed-case stored current email', async () => {
    const { orchestrator, assertEmailAvailable, issue, send } = buildOrchestrator({
      currentUser: { ...CURRENT_USER, email: 'Old@Example.com' },
    })

    await expect(
      orchestrator.request('user-1', { newEmail: 'old@example.com' }),
    ).rejects.toBeInstanceOf(EmailUnchangedError)
    expect(assertEmailAvailable).not.toHaveBeenCalled()
    expect(issue).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects an already-registered email without sending anything', async () => {
    const { orchestrator, send } = buildOrchestrator({
      assertEmailAvailable: () => Promise.reject(new EmailAlreadyRegisteredError()),
    })

    await expect(
      orchestrator.request('user-1', { newEmail: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError)
    expect(send).not.toHaveBeenCalled()
  })
})
