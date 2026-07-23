import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppContainer } from './AppContainer.tsx'
import { CONFIRM_EMAIL_ROUTE } from '@/app/constants/routes.ts'
import { apiClient } from '@/api/apiClient.ts'
import type { ConfirmEmailChangeResponse } from '@/types/api.ts'

const updateCurrentUser = vi.fn()

function CurrentPath(): React.ReactElement {
  const location = useLocation()

  return <output aria-label="Current path">{location.pathname}</output>
}

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => ({
    currentUser: null,
    isAuthenticated: false,
    isRestoringSession: false,
    updateCurrentUser,
  }),
}))

afterEach(() => {
  vi.restoreAllMocks()
  updateCurrentUser.mockReset()
})

describe('App email confirmation route', () => {
  it('confirms email for an unauthenticated visitor without redirecting to login', async () => {
    const updatedUser: ConfirmEmailChangeResponse = {
      id: 'user-1',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'Name',
      avatarUrl: null,
    }
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmEmailChange')
      .mockResolvedValue(updatedUser)

    render(
      <MemoryRouter initialEntries={['/confirm-email?token=public-token']}>
        <AppContainer />
        <CurrentPath />
      </MemoryRouter>,
    )

    expect(await screen.findByText('new@example.com')).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenCalledWith({ token: 'public-token' })
    expect(screen.getByLabelText('Current path')).toHaveTextContent(CONFIRM_EMAIL_ROUTE)
  })
})
