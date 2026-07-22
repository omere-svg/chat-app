import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SubscriptionCallbackScreenContainer } from './SubscriptionCallbackScreenContainer.tsx'
import { apiClient } from '@/api/apiClient.ts'
import type { Subscription } from '@/types/domain.ts'

const ACTIVE_SUBSCRIPTION: Subscription = {
  status: 'active',
  planCode: 'pro',
  activatedAt: '2026-01-01T00:00:00.000Z',
}

afterEach(() => {
  vi.restoreAllMocks()
})

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SubscriptionCallbackScreenContainer />
    </MemoryRouter>,
  )
}

describe('SubscriptionCallbackScreenContainer', () => {
  it('shows processing while activation is unresolved', () => {
    vi.spyOn(apiClient, 'getSubscription').mockReturnValue(
      new Promise<Subscription>(() => undefined),
    )

    renderAt('/subscription/callback?status=success')

    expect(screen.getByRole('status')).toHaveTextContent(/confirming your payment/i)
  })

  it('shows success once the subscription becomes active', async () => {
    const getSubscriptionSpy = vi
      .spyOn(apiClient, 'getSubscription')
      .mockResolvedValue(ACTIVE_SUBSCRIPTION)

    renderAt('/subscription/callback?status=success')

    expect(await screen.findByText(/now on pro/i)).toBeInTheDocument()
    expect(getSubscriptionSpy).toHaveBeenCalled()
  })

  it('explains a cancelled payment without polling', async () => {
    const getSubscriptionSpy = vi.spyOn(apiClient, 'getSubscription')

    renderAt('/subscription/callback?status=cancelled')

    expect(await screen.findByRole('alert')).toHaveTextContent(/cancelled/i)
    expect(getSubscriptionSpy).not.toHaveBeenCalled()
  })
})
