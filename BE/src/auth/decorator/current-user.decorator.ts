import { UnauthorizedException, createParamDecorator } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import type { PublicUser } from '../../users/user-public-view.js'

interface AuthenticatedRequest extends Request {
  user?: PublicUser
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PublicUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    if (request.user === undefined) {
      throw new UnauthorizedException({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'No authenticated user on request',
      })
    }

    return request.user
  },
)
