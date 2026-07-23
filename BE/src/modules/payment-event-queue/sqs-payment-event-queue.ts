import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs'
import type { ConfigService } from '@nestjs/config'
import { SQS_MAX_MESSAGES_PER_RECEIVE, SQS_WAIT_TIME_SECONDS } from './constants.js'
import { parsePaymentEventMessage } from './payment-event-queue.parser.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PaymentWebhookEvent } from '../payment-provider/types/payment-webhook-event.js'
import type { PaymentEventQueue, ReceivedPaymentEvent } from './types/payment-event-queue.js'

export class SqsPaymentEventQueue implements PaymentEventQueue {
  private readonly client: SQSClient
  private readonly queueUrl: string

  constructor(configService: ConfigService<AppEnvironment, true>) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID', { infer: true })
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY', { infer: true })

    this.queueUrl = configService.get('SQS_PAYMENT_QUEUE_URL', { infer: true })
    this.client = new SQSClient({
      region: configService.get('AWS_REGION', { infer: true }),
      credentials:
        accessKeyId !== '' && secretAccessKey !== ''
          ? { accessKeyId, secretAccessKey }
          : undefined,
    })
  }

  async enqueue(event: PaymentWebhookEvent): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
      }),
    )
  }

  async receive(): Promise<ReceivedPaymentEvent[]> {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: SQS_MAX_MESSAGES_PER_RECEIVE,
        WaitTimeSeconds: SQS_WAIT_TIME_SECONDS,
      }),
    )

    const received: ReceivedPaymentEvent[] = []
    for (const message of response.Messages ?? []) {
      if (message.Body === undefined || message.ReceiptHandle === undefined) {
        continue
      }
      const event = parsePaymentEventMessage(message.Body)
      if (event === null) {
        continue
      }
      received.push({ event, receiptHandle: message.ReceiptHandle })
    }
    return received
  }

  async acknowledge(receiptHandle: string): Promise<void> {
    await this.client.send(
      new DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle: receiptHandle }),
    )
  }
}
