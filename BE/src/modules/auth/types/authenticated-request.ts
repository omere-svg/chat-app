import type { Request } from 'express'
import type { User } from '../../users/types/user.js'

export interface AuthenticatedRequest extends Request {
  user?: User
}
