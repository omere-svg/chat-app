import { describe, expect, it, vi } from 'vitest'
import { ConfirmEmailChangeOrchestrator } from '../confirm-email-change.orchestrator.js'
import { EmailChangeTokenInvalidError } from '../../email-change-token/errors/email-change-token-invalid.error.js'
import type { EmailChangeTokenService } from '../../email-change-token/email-change-token.service.js'
import type { UsersService } from '../../users/users.service.js'
import type { User } from '../../users/types/user.js'

const UPDATED_USER: User = {
  id: 'user-1',
  email: 'new@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
}

describe('ConfirmEmailChangeOrchestrator', () => {
  it('verifies the token and applies the confirmed email change', async () => {
    const verify = vi.fn().mockResolvedValue({ userId: 'user-1', newEmail: 'new@example.com' })
    const applyConfirmedEmailChange = vi.fn().mockResolvedValue(UPDATED_USER)
    const orchestrator = new ConfirmEmailChangeOrchestrator(
      { verify } as unknown as EmailChangeTokenService,
      { applyConfirmedEmailChange } as unknown as UsersService,
    )

    const result = await orchestrator.confirm({ token: 'signed-token' })

    expect(verify).toHaveBeenCalledWith('signed-token')
    expect(applyConfirmedEmailChange).toHaveBeenCalledWith('user-1', 'new@example.com')
    expect(result).toEqual(UPDATED_USER)
  })

  it('propagates an invalid-token error without touching the user', async () => {
    const verify = vi.fn().mockRejectedValue(new EmailChangeTokenInvalidError())
    const applyConfirmedEmailChange = vi.fn()
    const orchestrator = new ConfirmEmailChangeOrchestrator(
      { verify } as unknown as EmailChangeTokenService,
      { applyConfirmedEmailChange } as unknown as UsersService,
    )

    await expect(orchestrator.confirm({ token: 'bad' })).rejects.toBeInstanceOf(
      EmailChangeTokenInvalidError,
    )
    expect(applyConfirmedEmailChange).not.toHaveBeenCalled()
  })
})
