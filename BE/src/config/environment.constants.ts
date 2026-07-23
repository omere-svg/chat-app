import type {
  AppEnvironment,
  NodeEnvironment,
  PaymentProviderKind,
  PaymentQueueKind,
} from './environment.types.js'

export const MIN_JWT_SECRET_LENGTH = 32

export const MIN_TCP_PORT = 1

export const MAX_TCP_PORT = 65_535

export const MIN_JWT_EXPIRY_SECONDS = 60

export const MAX_JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 30

export const MIN_ASSISTANT_MAX_TOKENS = 256

export const MAX_ASSISTANT_MAX_TOKENS = 16_384

export const DEFAULT_ASSISTANT_MODEL = 'gpt-4o-mini'

export const DEFAULT_ASSISTANT_MAX_TOKENS = 1024

export const DEFAULT_EMBEDDINGS_MODEL = 'text-embedding-3-small'

export const DEFAULT_AWS_REGION = 'us-east-1'

export const NODE_ENVIRONMENTS: readonly NodeEnvironment[] = ['development', 'test', 'production']

export const DEFAULT_NODE_ENV: NodeEnvironment = 'development'

export const REQUIRED_STORAGE_KEYS: readonly (keyof AppEnvironment)[] = [
  'S3_AVATAR_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AVATAR_CDN_BASE_URL',
]

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
