import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OtpCodeHasher } from './otp-code.hasher.js'
import { MongoPasswordResetOtpRepository } from './password-reset-otp.mongo.repository.js'
import { PASSWORD_RESET_OTP_REPOSITORY } from './password-reset-otp.repository.js'
import { PasswordResetOtpDocument, PasswordResetOtpSchema } from './password-reset-otp.schema.js'
import { PasswordResetOtpService } from './password-reset-otp.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PasswordResetOtpDocument.name, schema: PasswordResetOtpSchema },
    ]),
  ],
  providers: [
    PasswordResetOtpService,
    OtpCodeHasher,
    { provide: PASSWORD_RESET_OTP_REPOSITORY, useClass: MongoPasswordResetOtpRepository },
  ],
  exports: [PasswordResetOtpService],
})
export class PasswordResetOtpModule {}
