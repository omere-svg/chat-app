import type {
  AppEnvironment,
  PaymentProviderKind,
  PaymentQueueKind,
} from './environment.types.js'

export const DEFAULT_EMAIL_CHANGE_JWT_EXPIRES_IN = 60 * 30

export const REQUIRED_EMAIL_INTEGRATION_KEYS: readonly (keyof AppEnvironment)[] = [
  'SES_SOURCE_EMAIL',
]

export const DEFAULT_PAYMENT_PROVIDER_KIND: PaymentProviderKind = 'fake'

export const DEFAULT_PAYMENT_QUEUE_KIND: PaymentQueueKind = 'fake'

export const PAYMENT_PROVIDER_KINDS: readonly PaymentProviderKind[] = ['rapyd', 'fake']

export const PAYMENT_QUEUE_KINDS: readonly PaymentQueueKind[] = ['sqs', 'fake']

export const REQUIRED_RAPYD_KEYS: readonly (keyof AppEnvironment)[] = [
  'RAPYD_ACCESS_KEY',
  'RAPYD_SECRET_KEY',
  'RAPYD_BASE_URL',
  'RAPYD_WEBHOOK_SECRET',
]

export const REQUIRED_SQS_KEYS: readonly (keyof AppEnvironment)[] = ['SQS_PAYMENT_QUEUE_URL']
