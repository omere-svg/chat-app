import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import { UsersService } from '../../users/users.service.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PublicUser } from '../../users/user-public-view.js'
import type { AccessTokenClaims } from '../access-token-claims.type.js'

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AppEnvironment, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    })
  }

  async validate(claims: AccessTokenClaims): Promise<PublicUser> {
    const publicUser = await this.usersService.findPublicUserById(claims.sub)

    if (publicUser === null) {
      throw new UnauthorizedException({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Account associated with this token no longer exists',
      })
    }

    return publicUser
  }
}
