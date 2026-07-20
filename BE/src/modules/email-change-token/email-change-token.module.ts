import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailChangeTokenService } from './email-change-token.service.js'
import type { AppEnvironment } from '../../config/environment.types.js'

@Module({
  providers: [
    {
      provide: EmailChangeTokenService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): EmailChangeTokenService =>
        new EmailChangeTokenService(
          configService.get('EMAIL_CHANGE_JWT_SECRET', { infer: true }),
          configService.get('EMAIL_CHANGE_JWT_EXPIRES_IN', { infer: true }),
        ),
    },
  ],
  exports: [EmailChangeTokenService],
})
export class EmailChangeTokenModule {}
