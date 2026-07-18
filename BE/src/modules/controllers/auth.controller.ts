import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { SignupOrchestrator } from '../signup/signup.orchestrator.js'
import { LoginOrchestrator } from '../login/login.orchestrator.js'
import { SignupDto } from '../auth/DTO/signup.dto.js'
import { LoginDto } from '../auth/DTO/login.dto.js'
import type { AuthenticationResult } from '../auth/types/authentication-result.js'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupOrchestrator: SignupOrchestrator,
    private readonly loginOrchestrator: LoginOrchestrator,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() signupDto: SignupDto): Promise<AuthenticationResult> {
    return this.signupOrchestrator.signup(signupDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<AuthenticationResult> {
    return this.loginOrchestrator.login(loginDto)
  }
}
