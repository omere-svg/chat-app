import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { AuthTokenService } from '../auth/auth-token.service.js'
import type { AuthenticationResult } from '../auth/types/authentication-result.js'
import type { SignupDto } from './DTO/signup.dto.js'

@Injectable()
export class SignupOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthenticationResult> {
    const userRecord = await this.usersService.createUser({
      email: signupDto.email,
      password: signupDto.password,
      firstName: signupDto.firstName.trim(),
      lastName: signupDto.lastName.trim(),
    })

    const token = await this.authTokenService.issue(userRecord)
    return { token, user: this.usersService.toUser(userRecord) }
  }
}
