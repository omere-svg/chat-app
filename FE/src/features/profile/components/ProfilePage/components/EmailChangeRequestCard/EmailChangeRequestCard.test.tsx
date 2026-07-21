import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailChangeRequestCardContainer } from './EmailChangeRequestCardContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import type { User } from '@/types/domain.ts'

const currentUser: User = {
  id: 'user-1',
  email: 'old@example.com',
  firstName: 'Old',
  lastName: 'Name',
}

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => ({ currentUser, updateCurrentUser: vi.fn() }),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('EmailChangeRequestCardContainer', () => {
  it('requests a change and shows the confirmation-sent message', async () => {
    const user = userEvent.setup()
    const requestSpy = vi
      .spyOn(apiClient, 'requestEmailChange')
      .mockResolvedValue({ status: 'confirmation_sent' })

    render(<EmailChangeRequestCardContainer />)

    await user.type(screen.getByLabelText('New email'), 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Send confirmation' }))

    expect(await screen.findByText(/confirmation sent/i)).toBeInTheDocument()
    expect(requestSpy).toHaveBeenCalledWith({ newEmail: 'new@example.com' })
    expect(screen.getByLabelText('New email')).toHaveValue('')
  })

  it('keeps submit disabled when the new email matches the current email', async () => {
    const user = userEvent.setup()

    render(<EmailChangeRequestCardContainer />)

    await user.type(screen.getByLabelText('New email'), 'old@example.com')

    expect(screen.getByRole('button', { name: 'Send confirmation' })).toBeDisabled()
  })

  it('does not request confirmation for a malformed email', async () => {
    const user = userEvent.setup()
    const requestSpy = vi.spyOn(apiClient, 'requestEmailChange')

    render(<EmailChangeRequestCardContainer />)

    await user.type(screen.getByLabelText('New email'), 'not-an-email')

    expect(screen.getByRole('button', { name: 'Send confirmation' })).toBeDisabled()
    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('surfaces an email-already-registered error', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'requestEmailChange').mockRejectedValue(
      new ApiError(409, {
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'An account with this email already exists',
      }),
    )

    render(<EmailChangeRequestCardContainer />)

    await user.type(screen.getByLabelText('New email'), 'taken@example.com')
    await user.click(screen.getByRole('button', { name: 'Send confirmation' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists',
    )
  })
})
