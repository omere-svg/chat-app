import { describe, expect, it, vi } from 'vitest'
import { RequestPasswordResetOrchestrator } from '../request-password-reset.orchestrator.js'
import { PASSWORD_RESET_REQUEST_STATUS } from '../constants.js'
import type { EmailSender } from '../../email-sender/types/email-sender.js'
import type { PasswordResetOtpService } from '../../password-reset-otp/password-reset-otp.service.js'
import type { UsersService } from '../../users/users.service.js'
import type { UserRecord } from '../../users/types/user.entity.js'

const EXISTING_USER: UserRecord = {
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: 'hash',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatar: null,
  previousEmails: [],
  sessionsInvalidatedAt: null,
}

function buildOrchestrator(overrides?: { user?: UserRecord | null }): {
  orchestrator: RequestPasswordResetOrchestrator
  findRecordByEmail: ReturnType<typeof vi.fn>
  issue: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
} {
  const findRecordByEmail = vi
    .fn()
    .mockResolvedValue(overrides?.user === undefined ? EXISTING_USER : overrides.user)
  const usersService = { findRecordByEmail } as unknown as UsersService

  const issue = vi.fn().mockResolvedValue('123456')
  const passwordResetOtpService = { issue } as unknown as PasswordResetOtpService

  const send = vi.fn().mockResolvedValue(undefined)
  const emailSender: EmailSender = { send }

  return {
    orchestrator: new RequestPasswordResetOrchestrator(
      usersService,
      passwordResetOtpService,
      emailSender,
    ),
    findRecordByEmail,
    issue,
    send,
  }
}

describe('RequestPasswordResetOrchestrator', () => {
  it('issues a code and emails it when the account exists', async () => {
    const { orchestrator, issue, send } = buildOrchestrator()

    const result = await orchestrator.request({ email: 'User@Example.com' })

    expect(result).toEqual({ status: PASSWORD_RESET_REQUEST_STATUS })
    expect(issue).toHaveBeenCalledWith('user-1')
    const message = send.mock.calls[0]?.[0] as { to: string; textBody: string }
    expect(message.to).toBe('user@example.com')
    expect(message.textBody).toContain('123456')
  })

  it('returns the same generic status and sends nothing for an unknown account', async () => {
    const { orchestrator, issue, send } = buildOrchestrator({ user: null })

    const result = await orchestrator.request({ email: 'ghost@example.com' })

    expect(result).toEqual({ status: PASSWORD_RESET_REQUEST_STATUS })
    expect(issue).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })
})
