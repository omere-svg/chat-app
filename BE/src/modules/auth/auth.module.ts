import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module.js'
import { AuthTokenService } from './auth-token.service.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'
import { JwtAccessTokenStrategy } from './jwt-access-token.strategy.js'
import type { AppEnvironment } from '../../config/environment.types.js'

@Module({
  imports: [UsersModule, PassportModule],
  providers: [
    {
      provide: AuthTokenService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): AuthTokenService =>
        new AuthTokenService(
          configService.get('JWT_SECRET', { infer: true }),
          configService.get('JWT_EXPIRES_IN', { infer: true }),
        ),
    },
    JwtAccessTokenStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthTokenService, JwtAuthGuard, PassportModule],
})
export class AuthModule {}
