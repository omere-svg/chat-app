import { describe, expect, it, vi } from 'vitest'
import { ListPreviousEmailsOrchestrator } from '../list-previous-emails.orchestrator.js'
import type { UsersService } from '../../users/users.service.js'

function buildOrchestrator(): ListPreviousEmailsOrchestrator {
  const usersService = {
    getPreviousEmails: vi.fn().mockResolvedValue(['old@example.com']),
  } as unknown as UsersService

  return new ListPreviousEmailsOrchestrator(usersService)
}

describe('ListPreviousEmailsOrchestrator', () => {
  it('returns previous emails from the dedicated list action', async () => {
    const orchestrator = buildOrchestrator()

    await expect(orchestrator.list('user-1')).resolves.toEqual({
      previousEmails: ['old@example.com'],
    })
  })
})
