import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../users/users.service.js'
import { TokenOwnerNotFoundError } from './errors/token-owner-not-found.error.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PublicUser } from '../users/types/user-public-view.js'
import type { AccessTokenClaims } from './types/access-token-claims.js'

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
      throw new TokenOwnerNotFoundError()
    }

    return publicUser
  }
}
