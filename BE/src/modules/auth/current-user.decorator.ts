import { createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { MissingAuthenticatedUserError } from './errors/missing-authenticated-user.error.js'
import type { User } from '../users/types/user.js'
import type { AuthenticatedRequest } from './types/authenticated-request.js'

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    if (request.user === undefined) {
      throw new MissingAuthenticatedUserError()
    }

    return request.user
  },
)
