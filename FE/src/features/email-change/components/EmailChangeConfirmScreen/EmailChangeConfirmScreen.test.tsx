import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { EmailChangeConfirmScreenContainer } from './EmailChangeConfirmScreenContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import type { ConfirmEmailChangeResponse } from '@/types/api.ts'
import type { User } from '@/types/domain.ts'

const currentUser: User = {
  id: 'user-1',
  email: 'old@example.com',
  firstName: 'Old',
  lastName: 'Name',
}

let mockCurrentUser: User | null = currentUser
const updateCurrentUser = vi.fn()

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => ({ currentUser: mockCurrentUser, updateCurrentUser }),
}))

afterEach(() => {
  vi.restoreAllMocks()
  mockCurrentUser = currentUser
  updateCurrentUser.mockReset()
})

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <EmailChangeConfirmScreenContainer />
    </MemoryRouter>,
  )
}

describe('EmailChangeConfirmScreenContainer', () => {
  it('shows pending while confirmation is unresolved', () => {
    vi.spyOn(apiClient, 'confirmEmailChange').mockReturnValue(
      new Promise<ConfirmEmailChangeResponse>(() => undefined),
    )

    renderAt('/confirm-email?token=slow-token')

    expect(screen.getByText(/confirming/i)).toBeInTheDocument()
  })

  it('confirms a valid token and shows the new email', async () => {
    const updated: ConfirmEmailChangeResponse = {
      ...currentUser,
      email: 'new@example.com',
    }
    const confirmSpy = vi.spyOn(apiClient, 'confirmEmailChange').mockResolvedValue(updated)

    renderAt('/confirm-email?token=valid-token')

    expect(await screen.findByText('new@example.com')).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenCalledWith({ token: 'valid-token' })
    expect(updateCurrentUser).toHaveBeenCalledWith(updated)
  })

  it('does not update stale auth when the user logs out during confirmation', async () => {
    let resolveUpdate: (
      value: ConfirmEmailChangeResponse,
    ) => void = () => undefined
    const updatePromise = new Promise<ConfirmEmailChangeResponse>((resolve) => {
      resolveUpdate = resolve
    })
    const updated: ConfirmEmailChangeResponse = {
      ...currentUser,
      email: 'new@example.com',
    }
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmEmailChange')
      .mockReturnValue(updatePromise)
    const rendered = render(
      <MemoryRouter initialEntries={['/confirm-email?token=valid-token']}>
        <EmailChangeConfirmScreenContainer />
      </MemoryRouter>,
    )

    mockCurrentUser = null
    rendered.rerender(
      <MemoryRouter initialEntries={['/confirm-email?token=valid-token']}>
        <EmailChangeConfirmScreenContainer />
      </MemoryRouter>,
    )

    await act(async () => {
      resolveUpdate(updated)
      await updatePromise
    })

    expect(screen.getByText('new@example.com')).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(updateCurrentUser).not.toHaveBeenCalled()
  })

  it('confirms exactly once in production StrictMode', async () => {
    const updated: ConfirmEmailChangeResponse = {
      ...currentUser,
      email: 'new@example.com',
    }
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmEmailChange')
      .mockResolvedValue(updated)

    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/confirm-email?token=strict-token']}>
          <EmailChangeConfirmScreenContainer />
        </MemoryRouter>
      </StrictMode>,
    )

    expect(await screen.findByText('new@example.com')).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(confirmSpy).toHaveBeenCalledWith({ token: 'strict-token' })
  })

  it('confirms a new token when the route query changes', async () => {
    const firstUpdate: ConfirmEmailChangeResponse = {
      ...currentUser,
      email: 'first@example.com',
    }
    let resolveSecondUpdate: (
      value: ConfirmEmailChangeResponse,
    ) => void = () => undefined
    const secondUpdatePromise = new Promise<ConfirmEmailChangeResponse>(
      (resolve) => {
        resolveSecondUpdate = resolve
      },
    )
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmEmailChange')
      .mockResolvedValueOnce(firstUpdate)
      .mockReturnValueOnce(secondUpdatePromise)

    render(
      <MemoryRouter initialEntries={['/confirm-email?token=first-token']}>
        <Link to="/confirm-email?token=second-token">Use second token</Link>
        <EmailChangeConfirmScreenContainer />
      </MemoryRouter>,
    )

    expect(await screen.findByText('first@example.com')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Use second token' }))

    expect(screen.getByText(/confirming/i)).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenNthCalledWith(2, { token: 'second-token' })

    resolveSecondUpdate({ ...firstUpdate, email: 'second@example.com' })

    expect(await screen.findByText('second@example.com')).toBeInTheDocument()
  })

  it('ignores a stale result after the route token changes', async () => {
    let resolveFirstUpdate: (
      value: ConfirmEmailChangeResponse,
    ) => void = () => undefined
    const firstUpdatePromise = new Promise<ConfirmEmailChangeResponse>(
      (resolve) => {
        resolveFirstUpdate = resolve
      },
    )
    const secondUpdate: ConfirmEmailChangeResponse = {
      ...currentUser,
      email: 'second@example.com',
    }
    vi.spyOn(apiClient, 'confirmEmailChange')
      .mockReturnValueOnce(firstUpdatePromise)
      .mockResolvedValueOnce(secondUpdate)

    render(
      <MemoryRouter initialEntries={['/confirm-email?token=first-token']}>
        <Link to="/confirm-email?token=second-token">Use second token</Link>
        <EmailChangeConfirmScreenContainer />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Use second token' }))

    expect(await screen.findByText('second@example.com')).toBeInTheDocument()

    await act(async () => {
      resolveFirstUpdate({ ...secondUpdate, email: 'first@example.com' })
      await firstUpdatePromise
    })

    expect(screen.getByText('second@example.com')).toBeInTheDocument()
    expect(screen.queryByText('first@example.com')).not.toBeInTheDocument()
  })

  it('explains when the token is invalid or expired', async () => {
    vi.spyOn(apiClient, 'confirmEmailChange').mockRejectedValue(
      new ApiError(400, {
        code: 'EMAIL_CHANGE_TOKEN_INVALID',
        message: 'Invalid or expired token',
      }),
    )

    renderAt('/confirm-email?token=bad-token')

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid or has expired/i)
  })

  it('explains when the email became unavailable', async () => {
    vi.spyOn(apiClient, 'confirmEmailChange').mockRejectedValue(
      new ApiError(409, {
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'Email is already registered',
      }),
    )

    renderAt('/confirm-email?token=valid-token')

    expect(await screen.findByRole('alert')).toHaveTextContent(/no longer available/i)
  })

  it('shows retryable copy for an unexpected failure', async () => {
    vi.spyOn(apiClient, 'confirmEmailChange').mockRejectedValue(
      new TypeError('Network request failed'),
    )

    renderAt('/confirm-email?token=valid-token')

    expect(await screen.findByRole('alert')).toHaveTextContent(/try again/i)
  })

  it('shows the invalid state when no token is present', async () => {
    const confirmSpy = vi.spyOn(apiClient, 'confirmEmailChange')

    renderAt('/confirm-email')

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid or has expired/i)
    expect(confirmSpy).not.toHaveBeenCalled()
  })
})
