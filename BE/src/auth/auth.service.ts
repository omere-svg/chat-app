import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { toPublicUser } from '../users/user-public-view.js'
import { UsersService } from '../users/users.service.js'
import type { PublicUser } from '../users/user-public-view.js'
import type { UserRecord } from '../users/user.entity.js'
import type { AccessTokenClaims } from './access-token-claims.type.js'
import type { LoginDto } from './dto/login.dto.js'
import type { SignupDto } from './dto/signup.dto.js'

export interface AuthenticationResult {
  token: string
  user: PublicUser
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthenticationResult> {
    const userRecord = await this.usersService.createUser({
      email: signupDto.email,
      password: signupDto.password,
      displayName: signupDto.name.trim(),
    })

    return this.issueAuthentication(userRecord)
  }

  async login(loginDto: LoginDto): Promise<AuthenticationResult> {
    const userRecord = await this.usersService.verifyCredentials({
      email: loginDto.email,
      password: loginDto.password,
    })

    if (userRecord === null) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      })
    }

    return this.issueAuthentication(userRecord)
  }

  private async issueAuthentication(userRecord: UserRecord): Promise<AuthenticationResult> {
    const claims: AccessTokenClaims = { sub: userRecord.id, email: userRecord.email }
    const token = await this.jwtService.signAsync(claims)

    return { token, user: toPublicUser(userRecord) }
  }
}
