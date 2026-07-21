import type { AppEnvironment } from './environment.types.js'

export const DEFAULT_EMAIL_CHANGE_JWT_EXPIRES_IN = 60 * 30

export const REQUIRED_EMAIL_INTEGRATION_KEYS: readonly (keyof AppEnvironment)[] = [
  'SES_SOURCE_EMAIL',
]
