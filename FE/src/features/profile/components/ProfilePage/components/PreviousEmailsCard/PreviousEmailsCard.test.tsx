import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PreviousEmailsCardContainer } from './PreviousEmailsCardContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PreviousEmailsCardContainer', () => {
  it('renders the previous emails newest-first', async () => {
    vi.spyOn(apiClient, 'getPreviousEmails').mockResolvedValue([
      'first@example.com',
      'second@example.com',
    ])

    render(<PreviousEmailsCardContainer />)

    const items = await screen.findAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      'second@example.com',
      'first@example.com',
    ])
  })

  it('shows the empty state when there is no history', async () => {
    vi.spyOn(apiClient, 'getPreviousEmails').mockResolvedValue([])

    render(<PreviousEmailsCardContainer />)

    expect(await screen.findByText(/no previous emails yet/i)).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    vi.spyOn(apiClient, 'getPreviousEmails').mockRejectedValue(
      new ApiError(500, { code: 'INTERNAL_ERROR', message: 'boom' }),
    )

    render(<PreviousEmailsCardContainer />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/could not load/i)
    })
  })
})
