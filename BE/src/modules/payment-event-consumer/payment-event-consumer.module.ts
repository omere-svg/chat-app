import { Module } from '@nestjs/common'
import { PaymentEventQueueModule } from '../payment-event-queue/payment-event-queue.module.js'
import { ProcessPaymentEventModule } from '../process-payment-event/process-payment-event.module.js'
import { PaymentEventConsumer } from './payment-event-consumer.js'

@Module({
  imports: [PaymentEventQueueModule, ProcessPaymentEventModule],
  providers: [PaymentEventConsumer],
})
export class PaymentEventConsumerModule {}
