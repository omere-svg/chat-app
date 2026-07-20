import { JwtService } from '@nestjs/jwt'
import { EmailChangeTokenInvalidError } from './errors/email-change-token-invalid.error.js'
import type { EmailChangeTokenClaims } from './types/email-change-token-claims.js'

export class EmailChangeTokenService {
  private readonly jwtService: JwtService

  constructor(secret: string, expiresIn: number) {
    this.jwtService = new JwtService({ secret, signOptions: { expiresIn } })
  }

  issue(claims: EmailChangeTokenClaims): Promise<string> {
    return this.jwtService.signAsync({
      userId: claims.userId,
      newEmail: claims.newEmail,
    })
  }

  async verify(token: unknown): Promise<EmailChangeTokenClaims> {
    if (typeof token !== 'string' || token.length === 0) {
      throw new EmailChangeTokenInvalidError()
    }

    let payload: unknown
    try {
      payload = await this.jwtService.verifyAsync(token)
    } catch {
      throw new EmailChangeTokenInvalidError()
    }

    if (!isEmailChangeTokenClaims(payload)) {
      throw new EmailChangeTokenInvalidError()
    }
    return { userId: payload.userId, newEmail: payload.newEmail }
  }
}

function isEmailChangeTokenClaims(payload: unknown): payload is EmailChangeTokenClaims {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as EmailChangeTokenClaims).userId === 'string' &&
    typeof (payload as EmailChangeTokenClaims).newEmail === 'string'
  )
}
