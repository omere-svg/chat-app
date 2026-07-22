import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SubscriptionCardContainer } from './SubscriptionCardContainer.tsx'
import { apiClient } from '@/api/apiClient.ts'
import type { ListPlansResult, GetSubscriptionResult } from '@/types/api.ts'

const PRO_PLANS: ListPlansResult = {
  plans: [
    { code: 'free', name: 'Free', amount: 0, currency: 'USD', interval: 'month' },
    { code: 'pro', name: 'Pro', amount: 9.99, currency: 'USD', interval: 'month' },
  ],
}

const FREE_SUBSCRIPTION: GetSubscriptionResult = {
  status: 'none',
  planCode: null,
  activatedAt: null,
}

const ACTIVE_SUBSCRIPTION: GetSubscriptionResult = {
  status: 'active',
  planCode: 'pro',
  activatedAt: '2026-01-01T00:00:00.000Z',
}

const originalLocation = window.location

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
})

function renderCard(): void {
  render(
    <MemoryRouter>
      <SubscriptionCardContainer />
    </MemoryRouter>,
  )
}

describe('SubscriptionCardContainer', () => {
  it('shows the PRO plan and starts checkout on upgrade', async () => {
    vi.spyOn(apiClient, 'getSubscription').mockResolvedValue(FREE_SUBSCRIPTION)
    vi.spyOn(apiClient, 'listPlans').mockResolvedValue(PRO_PLANS)
    const createSessionSpy = vi
      .spyOn(apiClient, 'createPaymentSession')
      .mockResolvedValue({ checkoutUrl: 'https://checkout.example/session' })
    const assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    })

    renderCard()

    expect(await screen.findByText('Pro')).toBeInTheDocument()
    const upgradeButton = screen.getByRole('button', { name: 'Upgrade to PRO' })
    expect(upgradeButton).toBeEnabled()

    fireEvent.click(upgradeButton)

    await waitFor(() => {
      expect(createSessionSpy).toHaveBeenCalledWith({ planCode: 'pro' })
    })
    await waitFor(() => {
      expect(assignSpy).toHaveBeenCalledWith('https://checkout.example/session')
    })
  })

  it('shows the active state and disables upgrading when already on PRO', async () => {
    vi.spyOn(apiClient, 'getSubscription').mockResolvedValue(ACTIVE_SUBSCRIPTION)
    vi.spyOn(apiClient, 'listPlans').mockResolvedValue(PRO_PLANS)

    renderCard()

    expect(await screen.findByText(/on the pro plan/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PRO active' })).toBeDisabled()
  })
})
