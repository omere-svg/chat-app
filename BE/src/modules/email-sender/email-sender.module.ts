import { Module } from '@nestjs/common'
import { EMAIL_SENDER } from './email-sender.tokens.js'
import { SesEmailSender } from './ses-email-sender.js'

@Module({
  providers: [{ provide: EMAIL_SENDER, useClass: SesEmailSender }],
  exports: [EMAIL_SENDER],
})
export class EmailSenderModule {}
