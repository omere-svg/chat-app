import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePageContainer } from './ProfilePage.container.tsx'
import { apiClient, ApiError } from '../../api/apiClient.ts'
import type { User } from '../../types/domain.ts'

const currentUser: User = {
  id: 'user-1',
  email: 'old@example.com',
  firstName: 'Old',
  lastName: 'Name',
}

const { mockUpdateCurrentUser } = vi.hoisted(() => ({
  mockUpdateCurrentUser: vi.fn(),
}))

vi.mock('../../hooks/useAuth.ts', () => ({
  useAuth: () => ({ currentUser, updateCurrentUser: mockUpdateCurrentUser }),
}))

function renderProfile(): void {
  render(
    <MemoryRouter>
      <ProfilePageContainer />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  mockUpdateCurrentUser.mockReset()
})

describe('ProfilePageContainer', () => {
  it('disables Save name until the name actually changes', async () => {
    const user = userEvent.setup()
    renderProfile()

    const saveName = screen.getByRole('button', { name: 'Save name' })
    expect(saveName).toBeDisabled()

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'New')
    expect(saveName).toBeEnabled()
  })

  it('saves the updated name and syncs auth state', async () => {
    const user = userEvent.setup()
    const updated: User = { ...currentUser, firstName: 'New', lastName: 'Person' }
    const updateProfile = vi
      .spyOn(apiClient, 'updateProfile')
      .mockResolvedValue(updated)

    renderProfile()

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'New')
    await user.clear(screen.getByLabelText('Last name'))
    await user.type(screen.getByLabelText('Last name'), 'Person')
    await user.click(screen.getByRole('button', { name: 'Save name' }))

    expect(await screen.findByText('Name updated.')).toBeInTheDocument()
    expect(updateProfile).toHaveBeenCalledWith({ firstName: 'New', lastName: 'Person' })
    expect(mockUpdateCurrentUser).toHaveBeenCalledWith(updated)
  })

  it('saves a new email and clears the password field on success', async () => {
    const user = userEvent.setup()
    const updated: User = { ...currentUser, email: 'new@example.com' }
    vi.spyOn(apiClient, 'updateEmail').mockResolvedValue(updated)

    renderProfile()

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

    renderProfile()

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

    renderProfile()

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'taken@example.com')
    await user.type(screen.getByLabelText('Current password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Save email' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists',
    )
  })
})
