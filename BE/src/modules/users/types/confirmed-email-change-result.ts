import type { UserRecord } from './user.entity.js'

export type ConfirmedEmailChangeResult =
  | { outcome: 'user'; user: UserRecord }
  | { outcome: 'not-found' }
  | { outcome: 'email-taken' }
