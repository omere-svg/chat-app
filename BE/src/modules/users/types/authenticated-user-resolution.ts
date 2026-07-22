import type { User } from './user.js'

export type AuthenticatedUserResolution =
  | { outcome: 'authenticated'; user: User }
  | { outcome: 'not-found' }
  | { outcome: 'session-revoked' }
