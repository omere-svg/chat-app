import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { AuthTokenService } from '../auth/auth-token.service.js'
import { toPublicUser } from '../users/user.mapper.js'
import { InvalidCredentialsError } from '../auth/errors/invalid-credentials.error.js'
import type { AuthenticationResult } from '../auth/types/authentication-result.js'
import type { LoginDto } from '../auth/DTO/login.dto.js'

@Injectable()
export class LoginOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthenticationResult> {
    const userRecord = await this.usersService.verifyCredentials({
      email: loginDto.email,
      password: loginDto.password,
    })

    if (userRecord === null) {
      throw new InvalidCredentialsError()
    }

    const token = await this.authTokenService.issue(userRecord)
    return { token, user: toPublicUser(userRecord) }
  }
}
