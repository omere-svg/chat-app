import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { EmailMessage } from './types/email-message.js'
import type { EmailSender } from './types/email-sender.js'

@Injectable()
export class SesEmailSender implements EmailSender {
  private readonly client: SESClient
  private readonly sourceEmail: string

  constructor(configService: ConfigService<AppEnvironment, true>) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID', { infer: true })
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY', { infer: true })
    const sesRegion = configService.get('SES_REGION', { infer: true })

    this.sourceEmail = configService.get('SES_SOURCE_EMAIL', { infer: true })
    this.client = new SESClient({
      region: sesRegion !== '' ? sesRegion : configService.get('AWS_REGION', { infer: true }),
      credentials:
        accessKeyId !== '' && secretAccessKey !== ''
          ? { accessKeyId, secretAccessKey }
          : undefined,
    })
  }

  async send(message: EmailMessage): Promise<void> {
    await this.client.send(
      new SendEmailCommand({
        Source: this.sourceEmail,
        Destination: { ToAddresses: [message.to] },
        Message: {
          Subject: { Data: message.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: message.htmlBody, Charset: 'UTF-8' },
            Text: { Data: message.textBody, Charset: 'UTF-8' },
          },
        },
      }),
    )
  }
}
