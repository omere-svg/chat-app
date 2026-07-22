import { describe, expect, it, vi } from 'vitest'
import { SubscriptionService } from '../subscription.service.js'
import {
  SUBSCRIPTION_ACTIVE_STATUS,
  SUBSCRIPTION_NONE_STATUS,
} from '../constants.js'
import type { SubscriptionRepository } from '../subscription.repository.js'
import type { Subscription } from '../types/subscription.js'

const ACTIVE_SUBSCRIPTION: Subscription = {
  userId: 'user-1',
  planCode: 'pro',
  status: SUBSCRIPTION_ACTIVE_STATUS,
  activatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

function buildService(subscription: Subscription | null): {
  service: SubscriptionService
  activate: ReturnType<typeof vi.fn>
} {
  const activate = vi.fn().mockResolvedValue(undefined)
  const repository = {
    findByUserId: vi.fn().mockResolvedValue(subscription),
    activate,
  } as unknown as SubscriptionRepository
  return { service: new SubscriptionService(repository), activate }
}

describe('SubscriptionService', () => {
  it('returns a synthetic "none" subscription when the user has none', async () => {
    const { service } = buildService(null)

    const subscription = await service.getForUser('user-1')

    expect(subscription).toEqual({
      userId: 'user-1',
      planCode: null,
      status: SUBSCRIPTION_NONE_STATUS,
      activatedAt: null,
    })
    expect(await service.isActive('user-1')).toBe(false)
  })

  it('reports an active subscription', async () => {
    const { service } = buildService(ACTIVE_SUBSCRIPTION)

    expect(await service.getForUser('user-1')).toEqual(ACTIVE_SUBSCRIPTION)
    expect(await service.isActive('user-1')).toBe(true)
  })

  it('activates a subscription with the given plan', async () => {
    const { service, activate } = buildService(null)

    await service.activate('user-1', 'pro')

    const input = activate.mock.calls[0]?.[0] as { userId: string; planCode: string }
    expect(input.userId).toBe('user-1')
    expect(input.planCode).toBe('pro')
  })
})
