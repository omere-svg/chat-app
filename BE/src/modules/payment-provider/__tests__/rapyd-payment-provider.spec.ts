import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { RapydPaymentProvider } from '../rapyd-payment-provider.js'
import { PAYMENT_FAILED_OUTCOME, PAYMENT_SUCCEEDED_OUTCOME } from '../constants.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../../config/environment.types.js'

const WEBHOOK_SECRET = 'whsec-test'

const CONFIG_VALUES: Partial<Record<keyof AppEnvironment, string>> = {
  RAPYD_ACCESS_KEY: 'access-key',
  RAPYD_SECRET_KEY: 'secret-key',
  RAPYD_BASE_URL: 'https://sandboxapi.rapyd.net',
  RAPYD_WEBHOOK_SECRET: WEBHOOK_SECRET,
}

function buildProvider(): RapydPaymentProvider {
  const configService = {
    get: (key: keyof AppEnvironment) => CONFIG_VALUES[key] ?? '',
  } as unknown as ConfigService<AppEnvironment, true>
  return new RapydPaymentProvider(configService)
}

function sign(salt: string, timestamp: string, rawBody: string): string {
  const digest = createHmac('sha256', WEBHOOK_SECRET).update(salt + timestamp + rawBody).digest('hex')
  return Buffer.from(digest).toString('base64')
}

describe('RapydPaymentProvider', () => {
  describe('parseWebhookEvent', () => {
    const provider = buildProvider()

    it('maps a completion event to a succeeded outcome', () => {
      const event = provider.parseWebhookEvent(
        JSON.stringify({ id: 'evt-1', type: 'PAYMENT_COMPLETED', data: { id: 'checkout-1' } }),
      )
      expect(event).toEqual({
        id: 'evt-1',
        providerSessionId: 'checkout-1',
        outcome: PAYMENT_SUCCEEDED_OUTCOME,
      })
    })

    it('maps a failure event to a failed outcome and reads checkout_id', () => {
      const event = provider.parseWebhookEvent(
        JSON.stringify({ id: 'evt-2', type: 'PAYMENT_FAILED', data: { checkout_id: 'checkout-2' } }),
      )
      expect(event).toEqual({
        id: 'evt-2',
        providerSessionId: 'checkout-2',
        outcome: PAYMENT_FAILED_OUTCOME,
      })
    })

    it('ignores unknown event types', () => {
      expect(
        provider.parseWebhookEvent(
          JSON.stringify({ id: 'evt-3', type: 'PAYMENT_PENDING', data: { id: 'checkout-3' } }),
        ),
      ).toBeNull()
    })

    it('returns null when no provider session id is present', () => {
      expect(
        provider.parseWebhookEvent(JSON.stringify({ id: 'evt-4', type: 'PAYMENT_COMPLETED', data: {} })),
      ).toBeNull()
    })

    it('returns null for a non-JSON body', () => {
      expect(provider.parseWebhookEvent('not json')).toBeNull()
    })
  })

  describe('verifyWebhookSignature', () => {
    const provider = buildProvider()
    const rawBody = JSON.stringify({ id: 'evt-1', type: 'PAYMENT_COMPLETED' })
    const salt = 'salt-value'
    const timestamp = '1700000000'

    it('accepts a correctly signed webhook', () => {
      const headers = { signature: sign(salt, timestamp, rawBody), salt, timestamp }
      expect(provider.verifyWebhookSignature({ rawBody, headers })).toBe(true)
    })

    it('rejects a tampered body', () => {
      const headers = { signature: sign(salt, timestamp, rawBody), salt, timestamp }
      expect(
        provider.verifyWebhookSignature({ rawBody: rawBody + 'tampered', headers }),
      ).toBe(false)
    })

    it('rejects when signature headers are missing', () => {
      expect(provider.verifyWebhookSignature({ rawBody, headers: {} })).toBe(false)
    })
  })
})
