import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { MissingAuthenticatedUserError } from './errors/missing-authenticated-user.error.js'
import type { PublicUser } from '../users/types/user-public-view.js'

interface AuthenticatedRequest extends Request {
  user?: PublicUser
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    if (request.user === undefined) {
      throw new MissingAuthenticatedUserError()
    }

    return request.user
  },
)
