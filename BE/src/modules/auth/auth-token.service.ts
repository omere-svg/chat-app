import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AccessTokenClaims } from './types/access-token-claims.js'

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  issue(user: { id: string; email: string }): Promise<string> {
    const claims: AccessTokenClaims = { sub: user.id, email: user.email }
    return this.jwtService.signAsync(claims)
  }
}
