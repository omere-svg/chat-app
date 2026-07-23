import { describe, expect, it, vi } from 'vitest'
import { CreatePaymentSessionOrchestrator } from '../create-payment-session.orchestrator.js'
import { AlreadySubscribedError } from '../errors/already-subscribed.error.js'
import { PaymentProviderError } from '../errors/payment-provider.error.js'
import { PlanNotFoundError } from '../errors/plan-not-found.error.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../../config/environment.types.js'
import type { PlanService } from '../../plans/plan.service.js'
import type { SubscriptionService } from '../../subscriptions/subscription.service.js'
import type { PaymentSessionService } from '../../payment-sessions/payment-session.service.js'
import type { PaymentProvider } from '../../payment-provider/types/payment-provider.js'
import type { Plan } from '../../plans/types/plan.js'

const PRO_PLAN: Plan = {
  code: 'pro',
  name: 'Pro',
  amount: 9.99,
  currency: 'USD',
  interval: 'month',
  active: true,
}

function buildOrchestrator(overrides?: {
  plan?: Plan | null
  isActive?: boolean
  createCheckoutSession?: ReturnType<typeof vi.fn>
}): {
  orchestrator: CreatePaymentSessionOrchestrator
  findByCode: ReturnType<typeof vi.fn>
  isActive: ReturnType<typeof vi.fn>
  createSession: ReturnType<typeof vi.fn>
  createCheckoutSession: ReturnType<typeof vi.fn>
} {
  const findByCode = vi
    .fn()
    .mockResolvedValue(overrides?.plan === undefined ? PRO_PLAN : overrides.plan)
  const planService = { findByCode } as unknown as PlanService

  const isActive = vi.fn().mockResolvedValue(overrides?.isActive ?? false)
  const subscriptionService = { isActive } as unknown as SubscriptionService

  const createSession = vi.fn().mockResolvedValue(undefined)
  const paymentSessionService = { create: createSession } as unknown as PaymentSessionService

  const createCheckoutSession =
    overrides?.createCheckoutSession ??
    vi.fn().mockResolvedValue({
      providerSessionId: 'provider-session-1',
      checkoutUrl: 'https://checkout.example/session',
    })
  const paymentProvider = { createCheckoutSession } as unknown as PaymentProvider

  const configService = {
    get: vi.fn().mockReturnValue('https://app.example'),
  } as unknown as ConfigService<AppEnvironment, true>

  return {
    orchestrator: new CreatePaymentSessionOrchestrator(
      planService,
      subscriptionService,
      paymentSessionService,
      paymentProvider,
      configService,
    ),
    findByCode,
    isActive,
    createSession,
    createCheckoutSession,
  }
}

describe('CreatePaymentSessionOrchestrator', () => {
  it('starts checkout with the DB price and persists a pending session', async () => {
    const { orchestrator, createSession, createCheckoutSession } = buildOrchestrator()

    const result = await orchestrator.createSession('user-1', {
      planCode: 'pro',
    })

    expect(result).toEqual({ checkoutUrl: 'https://checkout.example/session' })
    const checkoutInput = createCheckoutSession.mock.calls[0]?.[0] as {
      amount: number
      currency: string
      successUrl: string
    }
    expect(checkoutInput.amount).toBe(9.99)
    expect(checkoutInput.currency).toBe('USD')
    expect(checkoutInput.successUrl).toContain('https://app.example/subscription/callback')
    expect(createSession).toHaveBeenCalledWith({
      userId: 'user-1',
      planCode: 'pro',
      providerSessionId: 'provider-session-1',
    })
  })

  it('rejects an unknown or inactive plan', async () => {
    const { orchestrator, createSession } = buildOrchestrator({ plan: null })

    await expect(
      orchestrator.createSession('user-1', { planCode: 'ghost' }),
    ).rejects.toBeInstanceOf(PlanNotFoundError)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('rejects when the user is already subscribed', async () => {
    const { orchestrator, createSession } = buildOrchestrator({ isActive: true })

    await expect(
      orchestrator.createSession('user-1', { planCode: 'pro' }),
    ).rejects.toBeInstanceOf(AlreadySubscribedError)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('wraps a provider failure and never persists a session', async () => {
    const { orchestrator, createSession } = buildOrchestrator({
      createCheckoutSession: vi.fn().mockRejectedValue(new Error('provider down')),
    })

    await expect(
      orchestrator.createSession('user-1', { planCode: 'pro' }),
    ).rejects.toBeInstanceOf(PaymentProviderError)
    expect(createSession).not.toHaveBeenCalled()
  })
})
