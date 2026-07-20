import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePageContainer } from './ProfilePageContainer.tsx'
import { apiClient } from '@/api/apiClient.ts'
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

describe('ProfilePageContainer', () => {
  it('renders the name card, email change card, previous emails, and back link', async () => {
    vi.spyOn(apiClient, 'getPreviousEmails').mockResolvedValue(['prev@example.com'])

    render(
      <MemoryRouter>
        <ProfilePageContainer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Save name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send confirmation' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Previous emails' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('prev@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to chat' })).toBeInTheDocument()
  })
})
