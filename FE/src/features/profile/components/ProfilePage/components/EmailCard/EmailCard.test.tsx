import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailCardContainer } from './EmailCardContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import type { User } from '@/types/domain.ts'

const currentUser: User = {
  id: 'user-1',
  email: 'old@example.com',
  firstName: 'Old',
  lastName: 'Name',
}

const { mockUpdateCurrentUser } = vi.hoisted(() => ({
  mockUpdateCurrentUser: vi.fn(),
}))

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => ({ currentUser, updateCurrentUser: mockUpdateCurrentUser }),
}))

afterEach(() => {
  vi.restoreAllMocks()
  mockUpdateCurrentUser.mockReset()
})

describe('EmailCardContainer', () => {
  it('saves a new email and clears the password field on success', async () => {
    const user = userEvent.setup()
    const updated: User = { ...currentUser, email: 'new@example.com' }
    vi.spyOn(apiClient, 'updateEmail').mockResolvedValue(updated)

    render(<EmailCardContainer />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Current password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Save email' }))

    expect(await screen.findByText('Email updated.')).toBeInTheDocument()
    expect(mockUpdateCurrentUser).toHaveBeenCalledWith(updated)
    expect(screen.getByLabelText('Current password')).toHaveValue('')
  })

  it('surfaces a wrong-password error without changing the email', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'updateEmail').mockRejectedValue(
      new ApiError(401, {
        code: 'INVALID_CREDENTIALS',
        message: 'Current password is incorrect',
      }),
    )

    render(<EmailCardContainer />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Current password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Save email' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Current password is incorrect',
    )
    expect(mockUpdateCurrentUser).not.toHaveBeenCalled()
  })

  it('surfaces an email-already-registered error', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'updateEmail').mockRejectedValue(
      new ApiError(409, {
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'An account with this email already exists',
      }),
    )

    render(<EmailCardContainer />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'taken@example.com')
    await user.type(screen.getByLabelText('Current password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Save email' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists',
    )
  })
})
