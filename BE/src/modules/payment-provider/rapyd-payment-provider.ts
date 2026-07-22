import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { ConfigService } from '@nestjs/config'
import {
  PAYMENT_FAILED_OUTCOME,
  PAYMENT_SUCCEEDED_OUTCOME,
  RAPYD_CHECKOUT_PATH,
  RAPYD_DEFAULT_COUNTRY,
  RAPYD_FAILURE_EVENT_TYPES,
  RAPYD_SUCCESS_EVENT_TYPES,
} from './constants.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { CheckoutSession, CreateCheckoutSessionInput } from './types/checkout-session.js'
import type { PaymentOutcome, PaymentWebhookEvent } from './types/payment-webhook-event.js'
import type { PaymentProvider } from './types/payment-provider.js'
import type { RapydCheckoutResponse, RapydWebhookBody } from './types/rapyd-wire.js'
import type { WebhookHeaders, WebhookVerificationInput } from './types/webhook-verification-input.js'

const HTTP_POST_METHOD = 'post'

function readHeader(headers: WebhookHeaders, name: string): string | null {
  const value = headers[name]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

function signaturesMatch(candidate: string, expected: string): boolean {
  const candidateBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)
  if (candidateBuffer.length !== expectedBuffer.length) {
    return false
  }
  return timingSafeEqual(candidateBuffer, expectedBuffer)
}

function resolveOutcome(type: string): PaymentOutcome | null {
  if (RAPYD_SUCCESS_EVENT_TYPES.includes(type)) {
    return PAYMENT_SUCCEEDED_OUTCOME
  }
  if (RAPYD_FAILURE_EVENT_TYPES.includes(type)) {
    return PAYMENT_FAILED_OUTCOME
  }
  return null
}

export class RapydPaymentProvider implements PaymentProvider {
  private readonly accessKey: string
  private readonly secretKey: string
  private readonly baseUrl: string
  private readonly webhookSecret: string

  constructor(configService: ConfigService<AppEnvironment, true>) {
    this.accessKey = configService.get('RAPYD_ACCESS_KEY', { infer: true })
    this.secretKey = configService.get('RAPYD_SECRET_KEY', { infer: true })
    this.baseUrl = configService.get('RAPYD_BASE_URL', { infer: true })
    this.webhookSecret = configService.get('RAPYD_WEBHOOK_SECRET', { infer: true })
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    const body = JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      country: RAPYD_DEFAULT_COUNTRY,
      complete_checkout_url: input.successUrl,
      cancel_checkout_url: input.cancelUrl,
      merchant_reference_id: input.planCode,
    })
    const salt = randomBytes(12).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = this.signRequest(RAPYD_CHECKOUT_PATH, salt, timestamp, body)

    const response = await fetch(`${this.baseUrl}${RAPYD_CHECKOUT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_key: this.accessKey,
        salt,
        timestamp,
        signature,
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`Rapyd checkout request failed with status ${response.status.toString()}`)
    }

    const payload = (await response.json()) as RapydCheckoutResponse
    const providerSessionId = payload.data?.id
    const checkoutUrl = payload.data?.redirect_url
    if (providerSessionId === undefined || checkoutUrl === undefined) {
      throw new Error('Rapyd checkout response is missing an id or redirect_url')
    }

    return { providerSessionId, checkoutUrl }
  }

  verifyWebhookSignature({ rawBody, headers }: WebhookVerificationInput): boolean {
    const signature = readHeader(headers, 'signature')
    const salt = readHeader(headers, 'salt')
    const timestamp = readHeader(headers, 'timestamp')
    if (signature === null || salt === null || timestamp === null) {
      return false
    }

    const digest = createHmac('sha256', this.webhookSecret)
      .update(salt + timestamp + rawBody)
      .digest('hex')
    const expected = Buffer.from(digest).toString('base64')
    return signaturesMatch(signature, expected)
  }

  parseWebhookEvent(rawBody: string): PaymentWebhookEvent | null {
    let parsed: RapydWebhookBody
    try {
      parsed = JSON.parse(rawBody) as RapydWebhookBody
    } catch {
      return null
    }

    const { id, type, data } = parsed
    if (typeof id !== 'string' || typeof type !== 'string') {
      return null
    }

    const outcome = resolveOutcome(type)
    if (outcome === null) {
      return null
    }

    const providerSessionId = data?.id ?? data?.checkout_id
    if (typeof providerSessionId !== 'string') {
      return null
    }

    return { id, providerSessionId, outcome }
  }

  private signRequest(path: string, salt: string, timestamp: string, body: string): string {
    const toSign = HTTP_POST_METHOD + path + salt + timestamp + this.accessKey + this.secretKey + body
    const digest = createHmac('sha256', this.secretKey).update(toSign).digest('hex')
    return Buffer.from(digest).toString('base64')
  }
}
