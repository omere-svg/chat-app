import type { PublicUser } from '../../users/types/user-public-view.js'

export interface AuthenticationResult {
  token: string
  user: PublicUser
}
