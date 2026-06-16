import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import { SignupDto } from './dto/signup.dto.js'
import type { AuthenticationResult } from './auth.service.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() signupDto: SignupDto): Promise<AuthenticationResult> {
    return this.authService.signup(signupDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<AuthenticationResult> {
    return this.authService.login(loginDto)
  }
}
