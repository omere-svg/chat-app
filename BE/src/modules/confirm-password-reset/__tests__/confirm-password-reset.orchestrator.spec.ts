import { describe, expect, it, vi } from 'vitest'
import { ConfirmPasswordResetOrchestrator } from '../confirm-password-reset.orchestrator.js'
import { InvalidResetCodeError } from '../errors/invalid-reset-code.error.js'
import { PASSWORD_RESET_CONFIRM_STATUS } from '../constants.js'
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

function buildOrchestrator(overrides?: {
  user?: UserRecord | null
  verifyOutcome?: 'valid' | 'invalid'
}): {
  orchestrator: ConfirmPasswordResetOrchestrator
  verifyAndConsume: ReturnType<typeof vi.fn>
  resetPassword: ReturnType<typeof vi.fn>
} {
  const findRecordByEmail = vi
    .fn()
    .mockResolvedValue(overrides?.user === undefined ? EXISTING_USER : overrides.user)
  const resetPassword = vi.fn().mockResolvedValue(undefined)
  const usersService = { findRecordByEmail, resetPassword } as unknown as UsersService

  const verifyAndConsume = vi
    .fn()
    .mockResolvedValue({ outcome: overrides?.verifyOutcome ?? 'valid' })
  const passwordResetOtpService = { verifyAndConsume } as unknown as PasswordResetOtpService

  return {
    orchestrator: new ConfirmPasswordResetOrchestrator(usersService, passwordResetOtpService),
    verifyAndConsume,
    resetPassword,
  }
}

const VALID_INPUT = { email: 'User@Example.com', code: '123456', newPassword: 'new-secret' }

describe('ConfirmPasswordResetOrchestrator', () => {
  it('resets the password when the code is valid', async () => {
    const { orchestrator, verifyAndConsume, resetPassword } = buildOrchestrator()

    const result = await orchestrator.confirm(VALID_INPUT)

    expect(result).toEqual({ status: PASSWORD_RESET_CONFIRM_STATUS })
    expect(verifyAndConsume).toHaveBeenCalledWith({ userId: 'user-1', code: '123456' })
    expect(resetPassword).toHaveBeenCalledWith('user-1', 'new-secret')
  })

  it('rejects an invalid code without resetting the password', async () => {
    const { orchestrator, resetPassword } = buildOrchestrator({ verifyOutcome: 'invalid' })

    await expect(orchestrator.confirm(VALID_INPUT)).rejects.toBeInstanceOf(InvalidResetCodeError)
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it('rejects an unknown email with the same error and never checks the code (no enumeration)', async () => {
    const { orchestrator, verifyAndConsume, resetPassword } = buildOrchestrator({ user: null })

    await expect(orchestrator.confirm(VALID_INPUT)).rejects.toBeInstanceOf(InvalidResetCodeError)
    expect(verifyAndConsume).not.toHaveBeenCalled()
    expect(resetPassword).not.toHaveBeenCalled()
  })
})
