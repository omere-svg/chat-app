import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfilePageContainer } from './ProfilePageContainer.tsx'
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

describe('ProfilePageContainer', () => {
  it('renders the name card, email card, and back link', () => {
    render(
      <MemoryRouter>
        <ProfilePageContainer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Save name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save email' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to chat' }),
    ).toBeInTheDocument()
  })
})
