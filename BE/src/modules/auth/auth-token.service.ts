import { JwtService } from '@nestjs/jwt'
import type { AccessTokenClaims } from './types/access-token-claims.js'
import type { TokenSubject } from './types/token-subject.js'

export class AuthTokenService {
  private readonly jwtService: JwtService

  constructor(secret: string, expiresIn: number) {
    this.jwtService = new JwtService({ secret, signOptions: { expiresIn } })
  }

  issue(user: TokenSubject): Promise<string> {
    const claims: AccessTokenClaims = { sub: user.id, email: user.email }
    return this.jwtService.signAsync(claims)
  }
}
