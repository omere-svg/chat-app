import { JwtService } from '@nestjs/jwt'
import type { AccessTokenClaims } from './types/access-token-claims.js'

export class AuthTokenService {
  private readonly jwtService: JwtService

  constructor(secret: string, expiresIn: number) {
    this.jwtService = new JwtService({ secret, signOptions: { expiresIn } })
  }

  issue(user: { id: string; email: string }): Promise<string> {
    const claims: AccessTokenClaims = { sub: user.id, email: user.email }
    return this.jwtService.signAsync(claims)
  }
}
