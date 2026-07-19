import type { User } from '../../users/types/user.js'

export interface AuthenticationResult {
  token: string
  user: User
}
