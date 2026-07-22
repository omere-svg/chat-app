import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FakePaymentEventQueue } from './fake-payment-event-queue.js'
import { PAYMENT_EVENT_QUEUE } from './payment-event-queue.tokens.js'
import { SqsPaymentEventQueue } from './sqs-payment-event-queue.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { PaymentEventQueue } from './types/payment-event-queue.js'

@Module({
  providers: [
    {
      provide: PAYMENT_EVENT_QUEUE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): PaymentEventQueue =>
        configService.get('PAYMENT_QUEUE_KIND', { infer: true }) === 'sqs'
          ? new SqsPaymentEventQueue(configService)
          : new FakePaymentEventQueue(),
    },
  ],
  exports: [PAYMENT_EVENT_QUEUE],
})
export class PaymentEventQueueModule {}
