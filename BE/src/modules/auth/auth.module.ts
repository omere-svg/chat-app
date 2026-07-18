import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module.js'
import { AuthTokenService } from './auth-token.service.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'
import { JwtAccessTokenStrategy } from './jwt-access-token.strategy.js'
import type { JwtModuleOptions } from '@nestjs/jwt'
import type { AppEnvironment } from '../../config/environment.types.js'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): JwtModuleOptions => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }) },
      }),
    }),
  ],
  providers: [AuthTokenService, JwtAccessTokenStrategy, JwtAuthGuard],
  exports: [AuthTokenService, JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}
