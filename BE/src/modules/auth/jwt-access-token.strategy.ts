import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../users/users.service.js'
import { TokenOwnerNotFoundError } from './errors/token-owner-not-found.error.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { User } from '../users/types/user.js'
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

  async validate(claims: AccessTokenClaims): Promise<User> {
    const user = await this.usersService.findUserById(claims.sub)

    if (user === null) {
      throw new TokenOwnerNotFoundError()
    }

    return user
  }
}
