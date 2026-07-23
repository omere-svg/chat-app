import { describe, expect, it } from 'vitest'
import { FakePaymentProvider } from '../fake-payment-provider.js'
import { PAYMENT_SUCCEEDED_OUTCOME } from '../constants.js'

describe('FakePaymentProvider', () => {
  const provider = new FakePaymentProvider()

  it('returns the success url as a local checkout url', async () => {
    const checkout = await provider.createCheckoutSession({
      amount: 9.99,
      currency: 'USD',
      planCode: 'pro',
      successUrl: 'https://app.example/subscription/callback?status=success',
      cancelUrl: 'https://app.example/subscription/callback?status=cancelled',
    })

    expect(checkout.checkoutUrl).toBe('https://app.example/subscription/callback?status=success')
    expect(checkout.providerSessionId).toMatch(/^fake-/)
  })

  it('always verifies its own signatures', () => {
    expect(provider.verifyWebhookSignature()).toBe(true)
  })

  it('parses a well-formed webhook body', () => {
    const event = provider.parseWebhookEvent(
      JSON.stringify({
        id: 'evt-1',
        providerSessionId: 'provider-session-1',
        outcome: PAYMENT_SUCCEEDED_OUTCOME,
      }),
    )

    expect(event).toEqual({
      id: 'evt-1',
      providerSessionId: 'provider-session-1',
      outcome: PAYMENT_SUCCEEDED_OUTCOME,
    })
  })

  it('returns null for malformed or unknown-outcome bodies', () => {
    expect(provider.parseWebhookEvent('not json')).toBeNull()
    expect(provider.parseWebhookEvent(JSON.stringify({ id: 'x' }))).toBeNull()
    expect(
      provider.parseWebhookEvent(
        JSON.stringify({ id: 'x', providerSessionId: 'y', outcome: 'unknown' }),
      ),
    ).toBeNull()
  })
})
