import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NameCardContainer } from './NameCardContainer.tsx'
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

describe('NameCardContainer', () => {
  it('disables Save name until the name actually changes', async () => {
    const user = userEvent.setup()
    render(<NameCardContainer />)

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

    render(<NameCardContainer />)

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'New')
    await user.clear(screen.getByLabelText('Last name'))
    await user.type(screen.getByLabelText('Last name'), 'Person')
    await user.click(screen.getByRole('button', { name: 'Save name' }))

    expect(await screen.findByText('Name updated.')).toBeInTheDocument()
    expect(updateProfile).toHaveBeenCalledWith({
      firstName: 'New',
      lastName: 'Person',
    })
    expect(mockUpdateCurrentUser).toHaveBeenCalledWith(updated)
  })

  it('surfaces a save error without syncing auth state', async () => {
    const user = userEvent.setup()
    vi.spyOn(apiClient, 'updateProfile').mockRejectedValue(
      new ApiError(500, {
        code: 'INTERNAL_ERROR',
        message: 'Could not update name',
      }),
    )

    render(<NameCardContainer />)

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'New')
    await user.click(screen.getByRole('button', { name: 'Save name' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not update name',
    )
    expect(mockUpdateCurrentUser).not.toHaveBeenCalled()
  })
})
